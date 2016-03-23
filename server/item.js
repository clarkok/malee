'use strict';

let Promise = require('bluebird');
let Util = require('./util.js');
let Exception = require('./exception.js');
let moment = require('moment');

const TABLE_NAME = 'item';
const DEFAULT_PAGE = 20;

class Item {
    constructor(db) {
        this.db = db;
    }

    /**
     * @param shop_id
     * @param page_start
     * @param page_count
     *
     * @return Promise, resolve to array of items
     */
    listInShop(shop_id, page_start, page_count) {
        page_start = page_start || 0;
        page_count = page_count || DEFAULT_PAGE;

        this.db(TABLE_NAME).select('id', 'name', 'photo', 'price')
            .orderBy('id').where('id', '>', page_start).where({valid: 1, shop: shop_id}).limit(page_count)
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-1, 'Database Error'));
            });
    }

    /**
     * @param iid item id
     *
     * @return Promise, resolve to a single item
     */
    queryItem(iid) {
        this.db(TABLE_NAME).where({id: iid, valid: 1})
            .then((items) => items.length
                  ? (Promise.resolve(items[0]))
                  : Promise.reject(new Exception(-2, 'Item not found')))
            .catch((err) => {
                console.log(err);
                return Promsie.reject(new Exception(-3, 'Database Error'));
            });
    }

    /**
     * @param item
     *
     * @return Promise, resolve to the new item
     */
    newItem(item) {
        this.db(TABLE_NAME).insert(item)
            .then((id) => id.length ? this.queryItem(id[0]) : Promise.reject(new Exception(-4, 'Database Error')))
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-5, 'Database Error'));
            });
    }

    /**
     * @param new_item
     *
     * @return Promise, resolve to the new shop
     */
    updateItem(new_item) {
        new_item.valid = 1;
        this.db(TABLE_NAME).where('id', new_item.id).update(new_item)
            .then(() => this.queryItem(new_item.id))
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-6, 'Database Erro'));
            });
    }

    /**
     * @param id
     */
    deleteItem(id) {
        this.db(TABLE_NAME).where('id', id).update({valid: 0})
            .then(() => Promise.resolve())
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-7, 'Database Error'));
            });
    }

    /**
     * @param shop_id
     */
    deleteInShop(shop_id) {
        this.db(TABLE_NAME).where('shop', shop_id).update({valid: 0})
            .then(() => Promise.resolve())
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-7, 'Database Error'));
            });
    }
}
