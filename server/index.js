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
        .then((shop) => res.send({code: 0, shop}))
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
        .then((shop) => res.send({code: 0, shop}))
        .catch((e) => res.send(e));
});

app.delete('/shop/:id', checkUser, checkShop, (req, res) => {
    Promise.all([
        shop.deleteShop(req.params.id),
        item.deleteInShop(req.params.id)
    ])
        .then(() => res.send({code: 0}))
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
    new_item.shop = req.params.shop;

    item.newItem(new_item)
        .then((item) => res.send({code: 0, item}))
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
        .then((item) => res.send({code: 0, item}))
        .catch((e) => res.send(e));
});

app.delete('/item/:id', checkUser, checkItem, (req, res) => {
    item.deleteItem(req.params.id)
        .then(() => res.send({code: 0}))
        .catch((e) => res.send(e));
});

app.listen(config.port, (err) => {
    console.log(`Listenning on port ${config.port}`);
});
