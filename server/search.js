'use strict';

let Promise = require('bluebird');
let searchIndex = require('search-index');

let Util = require('./util.js');
let Exception = require('./exception.js');

let options = {
    nGramLength: 1
};

let si_promise = new Promise((resolve, reject) => {
    searchIndex(options, (err, si) => {
        if (err)    return reject(err);
        else        return resolve(si);
    });
});

si_promise.catch((err) => {
    console.error('Unable to initialize search index');
    console.error(err);
    process.exit(-1);
});

let shopBatchOptions = () => {
    return {
        fieldOptions: [
            {
                fieldName: 'name',
                weight: 2
            }
        ]
    };
}

exports.addShop = (shop) => {
    return new Promise((resolve, reject) => {
        shop = Util.chineseCutObject(shop);
        si_promise.then((si) => {
            console.log('add shop', shop);
            si.add([ shop ], shopBatchOptions(), (err) => {
                if (err)    return reject(err);
                else        return resolve();
            });
        })
    });
}

exports.removeShop = (shop_id) => {
    return new Promsie((resolve, reject) => {
        si_promise.then((si) => {
            si.del(shop_id, (err) => {
                if (err)    return reject(err);
                else        return resolve();
            });
        });
    });
}

exports.updateShop = (new_shop) => {
    return exports.removeShop(new_shop.id)
        .then(() => exports.addShop(new_shpo));
}

let itemBatchOptions = () => {
    return {
        fieldOptions: [
            {
                fieldName: 'name',
                weight: 2
            }
        ]
    };
}

exports.addItem = (item) => {
    return new Promise((resolve, reject) => {
        item = Util.chineseCutObject(Object.assign({}, item, { id: item.id + 10000 }));
        si_promise.then((si) => {
            si.add([ item ], itemBatchOptions(), (err) => {
                if (err)    return reject(err);
                else        return resolve();
            });
        });
    });
}

exports.removeItem = (item_id) => {
    return new Promise((resolve, reject) => {
        si_promise.then((si) => {
            si.del(item_id + 10000, (err) => {
                if (err)    return reject(err);
                else        return resolve();
            });
        });
    });
}

exports.updateItem = (new_item) => {
    return exports.removeItem(new_item.id)
        .then(() => exports.addItem(new_item));
}

exports.search = (words) => {
    let q = { query: { '*' : words } };

    return new Promise((resolve, reject) => {
        si_promise.then((si) => {
            si.search(q, (err, results) => {
                if (err)    return reject(err);
                else {
                    let ids = results.hits.map((hit) => parseInt(hit.document.id, 10));

                    return resolve({
                        shops: ids.filter((id) => (id < 10000)),
                        items: ids.filter((id) => (id >= 10000)).map((id) => (id - 10000))
                    });
                }
            });
        });
    });
}
