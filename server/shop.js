'use strict';

let Promise = require('bluebird');
let Util = require('./util.js');
let Exception = require('./exception.js');
let moment = require('moment');

const TABLE_NAME = 'shop';
const DEFAULT_PAGE = 10;

class Shop {
    constructor(db) {
        this.db = db;
    }

    /**
     * @param page_start start id of paging
     * @param page_count page number in a page
     *
     * @return Promise, resolve to array of shops
     */
    listShop(page_start, page_count) {
        page_start = page_start || 0;
        page_count = page_count || DEFAULT_PAGE;

        this.db(TABLE_NAME).orderBy('id').where('id', '>', page_start).where('valid', 1).limit(page_count)
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-1, 'Database Error'));
            });
    }

    /**
     * @param sid shop id
     *
     * @return Promise, resolve to a single shop
     */
    queryShop(sid) {
        this.db(TABLE_NAME).where('id', sid)
            .then((shops) => shops.length && shops[0].valid
                  ? (Promise.resolve(shops[0])) 
                  : Promise.reject(new Exception(-2, 'Shop not found')))
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-3, 'Database Error'));
            });
    }

    /**
     * @param shop
     *      {
     *          owner
     *          name
     *          desc
     *          photo
     *          phone
     *          address
     *      }
     *
     * @return Promise, resolve to the new shop
     */
    newShop(shop) {
        this.db(TABLE_NAME).insert(shop)
            .then((id) => id.length ? this.queryShop(id[0]) : Promise.reject(new Exception(-4, 'Database Error')))
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-5, 'Database Error'));
            });
    }

    /**
     * @param new_shop
     * @return Promise, resolve to the new shop
     */
    updateShop(new_shop) {
        new_shop.valid = 1;
        this.db(TABLE_NAME).where('id', new_shop.id).update(new_shop)
            .then(() => this.queryShop(new_shop.id))
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-6, 'Database Error'));
            });
    }

    /**
     * @param id
     */
    deleteShop(id) {
        this.db(TABLE_NAME).where('id', id).update({valid: 0})
            .then(() => Promise.resolve())
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-7, 'Database Error'));
            });
    }
}

module.exports = Shop;
