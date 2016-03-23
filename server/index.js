'use strict';

let Express = require('express');
let app = Express();
let config = require('./config.json');
let db = require('knex')({
    client: 'mysql',
    connection: config.database
});

let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let User = require('./user.js');
let user = new User(db);

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

app.use('/static', Express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

/* ======= NEED LOGIN ======= */

app.use((req, res, next) => {
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
});

app.post('/user/logout', (req, res) => {
    user.logout(req.token)
        .then(() => res.send({code: 0}))
        .catch((e) => res.send(e));
});

app.get('/user', (req, res) => {
    res.send({
        code: 0,
        user: req.user
    });
});

app.put('/user', (req, res) => {
    let new_user = req.body;

    delete new_user.balance;
    delete new_user.name;
    new_user.id = req.user.id;

    user.update(new_user)
        .then((user) => res.send({code: 0, user}))
        .catch((e) => res.send(e));
});

app.listen(config.port, (err) => {
    console.log(`Listenning on port ${config.port}`);
});
