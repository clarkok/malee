'use strict';

let Express = require('express');
let app = Express();
let config = require('./config.json');
let db = require('knex')({
    client: 'mysql',
    connection: config.database
});

let User = require('./user.js');

app.use('/', (req, res, next) => {
    console.log((new Date()), req.method, req.url);
    return next();
});

app.listen(config.port, (err) => {
    console.log(`Listenning on port ${config.port}`);
});
