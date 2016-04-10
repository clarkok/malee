'use strict';

let Promise = require('bluebird');
let moment = require('moment');

let Utils = require('./util.js');
let Exception = require('./exception.js');

const TABLE_NAME = 'order';
const SECRET_LENGTH = 6;

const CANCELLED_STATE   = 0;
const UNPAID_STATE      = 1;
const PAID_STATE        = 2;
const CONFIRMED_STATE   = 3;
const DELIVERED_STATE   = 4;

class Order {
    constructor(db, user, shop, item) {
        this.db = db;
        this.user = user;
        this.shop = shop;
        this.item = item;
    }

    queryShopForOrder(order) {
        return this.shop.queryShop(order.sid).then((shop) => { order.shop = shop; return Promise.resolve(order) })
    }

    queryItemsForOrder(order) {
        return Promise.map(Object.getOwnPropertyNames(order.item_list), (item_id) => {
            let number = order.item_list[item_id];
            return this.item.queryItem(item_id)
                .then((item) => Promise.resolve({item, number}));
        }).then((item_list) => { order.item_list = item_list; return Promise.resolve(order); });
    }

    queryOrderWithSecret(oid) {
        return this.db(TABLE_NAME).where('id', oid)
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-1, 'Database Error'));
            })
            .then((orders) => orders.length ? Promise.resolve(orders[0]) : Promise.reject(new Exception(-1, 'No such order')))
            .then((order) => { order.item_list = JSON.parse(order.item_list); return Promise.resolve(order); })
            .then((order) => this.queryShopForOrder(order))
            .then((order) => this.queryItemsForOrder(order));
    }

    queryOrder(oid) {
        return this.queryOrderWithSecret(oid).then((order) => { delete order.secret; return Promise.resolve(order); })
    }

    newOrder(uid, sid, item_list) {
        sid = parseInt(sid, 10);
        return this.item.calculateTotal(sid, item_list)
            .then((total) => {
                return this.db(TABLE_NAME).insert({
                    uid, sid, time: moment().format('YYYY-MM-DD HH:mm:ss'),
                    total, item_list: JSON.stringify(item_list),
                    secret: Utils.randomNumberString(SECRET_LENGTH)
                })
                .catch((err) => {
                    console.log(err);
                    return Promise.reject(new Exception(-1, 'Database error'));
                });
            })
            .then((order_id) => this.queryOrder(order_id[0]));
    }

    listCustomerOrder(uid) {
        return this.db(TABLE_NAME).select('id').where('uid', uid)
            .then((order_ids) => {
                order_ids = order_ids.map((order_id) => order_id.id);
                return Promise.map(order_ids, (order_id) => this.queryOrderWithSecret(order_id))
            });
    }

    listSellerOrder(uid) {
        return this.shop.queryShopIdByOwner(uid)
            .then((shop_ids) => {
                shop_ids = shop_ids.map((shop_id) => shop_id.id);
                return Promise.reduce(shop_ids, (order_ids, shop_id) => {
                    return this.db(TABLE_NAME).select('id').where('sid', shop_id)
                        .then((order_ids_in_shop) => {
                            return order_ids.concat(order_ids_in_shop);
                        });
                }, [])
            })
            .then((order_ids) => {
                order_ids = order_ids.map((order_id) => order_id.id);
                return Promise.map(order_ids, (order_id) => this.queryOrder(order_id))
            });
    }

    updateOrderState(oid, state) {
        return this.db(TABLE_NAME).update({state}).where('id', oid)
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-2, 'Database Error'));
            });
    }

    cancelOrder(oid) {
        return this.queryOrder(oid)
            .then((order) => {
                return (order.state == UNPAID_STATE) 
                    ? this.updateOrderState(oid, CANCELLED_STATE)
                    : Promise.reject(new Exception(-3, 'Order state invalid'))
            })
            .then(() => this.queryOrderWithSecret(oid))
    }

    payOrder(oid) {
        return this.queryOrder(oid)
            .then((order) => {
                return (order.state == UNPAID_STATE)
                    ? this.user.checkoutMoney(order.uid, order.total / 100)
                    : Promise.reject(new Exception(-3, 'Order state invalid'));
            })
            .then(() => this.updateOrderState(oid, PAID_STATE))
            .then(() => this.queryOrderWithSecret(oid));
    }

    confirmOrder(oid) {
        return this.queryOrder(oid)
            .then((order) => {
                return (order.state == PAID_STATE)
                    ? this.updateOrderState(oid, CONFIRMED_STATE)
                    : Promise.reject(new Exception(-4, 'Order state invalid'));
            })
            .then(() => this.queryOrder(oid));
    }

    deliverOrder(oid, secret) {
        return this.queryOrderWithSecret(oid)
            .then((order) => {
                if (order.state != CONFIRMED_STATE) {
                    return Promise.reject(new Exception(-5, 'Order not confirmed'));
                }

                console.log(order.secret, secret);

                if (order.secret != secret) {
                    return Promise.reject(new Exception(-6, 'Secret invalid'));
                }

                return this.shop.queryShop(order.sid)
                    .then((shop) => this.user.checkinMoney(shop.owner, order.total))
                    .then(() => this.updateOrderState(oid, DELIVERED_STATE));
            })
            .then(() => this.queryOrder(oid));
    }
}

module.exports = Order;
