'use strict';

let Express = require('express');
let app = Express();
let config = require('./config.json');
let db = require('knex')({
    client: 'mysql',
    connection: config.database
});

let Promise = require('bluebird');
let Exception = require('./exception.js');

let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let User = require('./user.js');
let user = new User(db);

let Shop = require('./shop.js');
let shop = new Shop(db);

let Item = require('./item.js');
let item = new Item(db);

let Order = require('./order.js');
let order = new Order(db, user, shop, item);

let search = require('./search.js');

let Util = require('./util.js');

app.use((req, res, next) => {
    console.log((new Date()), req.method, req.url);
    return next();
});

app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieParser());

app.post('/user', (req, res) => {
    if (
        !req.body ||
        !req.body.name ||
        !req.body.password
    ) {
        return res.send({
            code: -1,
            msg: 'Invalid username or password'
        });
    }

    if (
        req.body.role && 
        req.body.role != 'customer' &&
        req.body.role != 'seller'
    ) {
        return res.send({
            code: -2,
            msg: 'Invalid role'
        });
    }

    delete req.body.balance;

    user.register(req.body)
        .then((user) => res.send({code: 0, user}))
        .catch((e) => res.send(e));
});

app.post('/user/login', (req, res) => {
    if (
        !req.body ||
        !req.body.username ||
        !req.body.password
    ) {
        return res.send({
            code: -1,
            msg: 'No username or password'
        });
    }

    user.login(req.body.username, req.body.password)
        .then((token) => res.send({code: 0, token}))
        .catch((e) => res.send(e));
});

app.get('/user/:uid', (req, res) => {
    user.queryUser(req.params.uid)
        .then((user) => {
            delete user.address;
            delete user.phone;
            delete user.balance;
            res.send({code: 0, user});
        })
        .catch((e) => res.send(e));
});

app.get('/shop', (req, res) => {
    shop.listShop(
        req.query && req.query.page_start,
        req.query && req.query.page_count
    )
        .then((shops) => res.send({code: 0, shops}))
        .catch((e) => res.send(e));
});

app.get('/shop/:id', (req, res) => {
    shop.queryShop(req.params.id)
        .then((shop) => res.send({code: 0, shop}))
        .catch((e) => res.send(e));
});

app.get('/shop/:id/items', (req, res) => {
    item.listInShop(
        req.params.id,
        req.query && req.query.page_start,
        req.query && req.query.page_count
    )
        .then((items) => res.send({code: 0, items}))
        .catch((e) => res.send(e));
});

app.get('/item/:id', (req, res) => {
    item.queryItem(req.params.id)
        .then((item) => res.send({code: 0, item}))
        .catch((e) => res.send(e));
});

app.get('/search', (req, res) => {
    let query = Util.chineseCut((req.query && req.query.q) || '', '+');
    let words = query.split('+');
    search.search(words)
        .then((result) => {
            return Promise.join(
                Promise.map(result.shops, (shop_id) => shop.queryShop(shop_id)),
                Promise.map(result.items, (item_id) => item.queryItem(item_id)),
                (shops, items) => Promise.resolve({shops, items})
            );
        })
        .then((result) => res.send(result))
        .catch((e) => res.send(e));
});

app.use('/', Express.static('public'));

/* ======= NEED LOGIN ======= */

function checkUser (req, res, next) {
    let token =
        (req.body && req.body.token) ||
        (req.query && req.query.token) ||
        (req.cookies && req.cookies.token);

    if (!token) {
        return res.send({
            code: -400,
            msg: 'Need login'
        });
    }

    user.valid(token)
        .then((user) => {
            req.token = token;
            req.user = user;
            return next();
        })
        .catch((e) => res.send(e));
}

app.post('/user/logout', checkUser, (req, res) => {
    user.logout(req.token)
        .then(() => res.send({code: 0}))
        .catch((e) => res.send(e));
});

app.get('/user', checkUser, (req, res) => {
    res.send({
        code: 0,
        user: req.user
    });
});

app.put('/user', checkUser, (req, res) => {
    let new_user = req.body;

    delete new_user.balance;
    delete new_user.name;
    new_user.id = req.user.id;

    user.update(new_user)
        .then((user) => res.send({code: 0, user}))
        .catch((e) => res.send(e));
});

app.post('/shop', checkUser, (req, res) => {
    if (req.user.role !== 'seller') {
        return res.send({
            code: -1,
            msg: 'Not a seller'
        });
    }

    let new_shop = req.body;
    if (!new_shop || !new_shop.name) {
        return res.send({
            code: -2,
            msg: 'No shop name'
        });
    }

    delete new_shop.id;
    new_shop.owner = req.user.id;
    shop.newShop(new_shop)
        .then((shop) => {
            search.addShop(shop).catch((err) => {
                console.log('Add shop error', err);
            });
            res.send({code: 0, shop});
        })
        .catch((e) => res.send(e));
});

function checkShop(req, res, next) {
    shop.queryShop(req.params.id)
        .then((shop) => {
            if (shop.owner != req.user.id) {
                return Promise.reject(new Exception(-1, 'Not the owner'));
            }
            req.shop = shop;
            next();
        })
        .catch((e) => res.send(e));
}

app.put('/shop/:id', checkUser, checkShop, (req, res) => {
    let new_shop = req.body;
    new_shop.id = req.params.id;
    new_shop.owner = req.user.id;

    shop.updateShop(new_shop)
        .then((shop) => {
            res.send({code: 0, shop});
            search.updateShop(shop).catch((err) => {
                console.log('Update shop error', err);
            });
        })
        .catch((e) => res.send(e));
});

app.delete('/shop/:id', checkUser, checkShop, (req, res) => {
    Promise.all([
        shop.deleteShop(req.params.id),
        item.deleteInShop(req.params.id)
    ])
        .then(() => {
            res.send({code: 0});
            search.removeShop(req.params.id).catch((err) => {
                console.log('Remove shop error', err);
            });
        })
        .catch((e) => res.send(e));
});

app.post('/shop/:id/item', checkUser, checkShop, (req, res) => {
    let new_item = req.body;

    if (!new_item || !new_item.name) {
        return res.send({
            code: -1,
            msg: 'No item name'
        });
    }

    new_item.owner = req.user.id;
    new_item.shop = req.params.id;

    item.newItem(new_item)
        .then((item) => {
            res.send({code: 0, item});
            search.addItem(item).catch((err) => {
                console.log('Add item error', err);
            });
        })
        .catch((e) => res.send(e));
});

function checkItem(req, res, next) {
    item.queryItem(req.params.id)
        .then((item) => {
            if (item.owner != req.user.id) {
                return Promise.reject(new Exception(-1, 'Not the owner'));
            }
            req.item = item;
            next();
        })
        .catch((e) => res.send(e));
}

app.put('/item/:id', checkUser, checkItem, (req, res) => {
    let new_item = req.body;
    new_item.id = req.params.id;
    new_item.owner = req.user.id;
    new_item.shop = req.item.shop;

    item.updateItem(new_item)
        .then((item) => {
            res.send({code: 0, item});
            search.updateItem(item).catch((err) => {
                console.log('Update item error', err);
            });
        })
        .catch((e) => res.send(e));
});

app.delete('/item/:id', checkUser, checkItem, (req, res) => {
    item.deleteItem(req.params.id)
        .then(() => {
            res.send({code: 0});
            search.removeItem(req.params.id).catch((err) => {
                console.log('Remove item error', err);
            });
        })
        .catch((e) => res.send(e));
});

app.post('/shop/:id/order', checkUser, (req, res) => {
    order.newOrder(req.user.id, req.params.id, JSON.parse(req.body.item_list))
        .then((order) => {
            return res.send({code: 0, order});
        })
        .catch((e) => res.send(e));
});

app.get('/order', checkUser, (req, res) => {
    (req.user.role == 'customer' ? order.listCustomerOrder(req.user.id) : order.listSellerOrder(req.user.id))
        .then((orders) => {
            return res.send({code: 0, orders});
        })
        .catch((e) => res.send(e));
});

function checkOrderCustomer(req, res, next) {
    order.queryOrder(req.params.id)
        .then((order) => {
            if (order.uid != req.user.id) {
                return Promise.reject(new Exception(-1, 'Not the customer'));
            }
            req.order = order;
            next();
        })
        .catch((e) => res.send(e));
}

function checkOrderSeller(req, res, next) {
    order.queryOrder(req.params.id)
        .then((order) => {
            if (order.shop.owner != req.user.id) {
                return Promise.reject(new Exception(-1, 'Not the seller'));
            }
            req.order = order;
            next();
        })
        .catch((e) => res.send(e));
}

app.get('/order/:id', checkUser, checkOrderCustomer, (req, res) => {
    res.send({code: 0, order: req.order});
});

app.post('/order/:id/cancel', checkUser, checkOrderCustomer, (req, res) => {
    order.cancelOrder(req.order.id)
        .then((order) => {
            res.send({ code: 0, order });
        })
        .catch((e) => res.send(e));
});

app.post('/order/:id/pay', checkUser, checkOrderCustomer, (req, res) => {
    order.payOrder(req.order.id)
        .then((order) => {
            res.send({ code: 0, order });
        })
        .catch((e) => res.send(e));
});

app.post('/order/:id/confirm', checkUser, checkOrderSeller, (req, res) => {
    order.confirmOrder(req.order.id)
        .then((order) => {
            res.send({ code: 0, order });
        })
        .catch((e) => res.send(e));
});

app.post('/order/:id/deliver', checkUser, checkOrderSeller, (req, res) => {
    order.deliverOrder(req.order.id, req.body.secret)
        .then((order) => {
            res.send({ code: 0, order });
        })
        .catch((e) => res.send(e));
});

app.listen(config.port, (err) => {
    console.log(`Listenning on port ${config.port}`);
});
