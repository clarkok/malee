'use strict';

let Promise = require('bluebird');
let Util = require('./util.js');
let Exception = require('./exception.js');
let moment = require('moment');

const TABLE_NAME = 'user';
const SALT_LENGTH = 256;
const TOKEN_TABLE_NAME = 'token';
const TOKEN_LENGTH = 256;
const EXPIRE_DAY = 7;

class User {
    constructor(db) {
        this.db = db;
    }

    generateSalt() {
        return Util.randomString(SALT_LENGTH);
    }

    generateToken() {
        return Util.randomString(TOKEN_LENGTH);
    }

    passwordHash(username, password, salt) {
        return Util.sha1(username + password + salt);
    }

    findUser(username) {
        return this.db(TABLE_NAME).where('name', username)
            .then((users) => (users.length ? Promise.resolve(users[0]) : Promise.reject(new Exception(-1, 'User not found'))));
    }

    getUser(uid) {
        return this.db(TABLE_NAME).where('id', uid)
            .then((users) => (users.length ? Promise.resolve(users[0]) : Promise.reject(new Exception(-1, 'User not found'))));
    }

    queryUser(uid) {
        return this.getUser(uid)
            .then((user) => {
                delete user.salt;
                delete user.password;

                return Promise.resolve(user);
            });
    }

    /**
     * @param username
     * @param password
     *
     * @return Promise resolve to user
     */
    checkPassword(username, password) {
        return this.findUser(username)
            .then((user) => {
                let hash = this.passwordHash(username, password, user.salt);
                if (hash == user.password) {
                    return Promise.resolve(user);
                }
                else {
                    return Promise.reject(new Exception(-4, 'Invalid username or password'));
                }
            });
    }

    /**
     * @param user
     *      name:       username
     *      password:   raw password
     *      role:       user role
     *      nickname:   user nickname
     *      address
     *      phone
     *
     * @return Promise, resolve to user
     */
    register(user) {
        return this.findUser(user.name)
            .then((user) => Promise.reject(new Exception(-1, 'User exists')))
            .catch(() => {
                user.salt = this.generateSalt();
                user.password = this.passwordHash(user.name, user.password, user.salt);

                return this.db(TABLE_NAME).insert(user)
                    .then((id) => {
                        return this.queryUser(id[0]);
                    })
                    .catch((err) => {
                        console.log(err);
                        return Promise.reject(new Exception(-2, 'Database Error'));
                    });
            });
    }

    /**
     * @param new_user
     *
     * @return Promise, resolve to user
     */
    update(new_user) {
        return this.db(TABLE_NAME).where(new_user.id).update(new_user)
            .then(() => this.queryUser(new_user.id))
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-11, 'Database Error'));
            });
    }

    /**
     * @param username
     * @param password
     *
     * @return Promise, resolve to token
     */
    login(username, password) {
        return this.checkPassword(username, password)
            .then((user) => {
                let token = {
                    uid: user.id,
                    token: this.generateToken(),
                    expire: moment().add(EXPIRE_DAY, 'days').format('YYYY-MM-DD')
                };
                return this.db(TOKEN_TABLE_NAME).insert(token)
                    .then((token_id) => Promise.resolve(token.token))
                    .catch((err) => {
                        console.log(err);
                        return Promise.reject(new Exception(-3, 'Database Error'));
                    });
            });
    }

    /**
     * @param token
     *
     * @return Promise resolve to user
     */
    valid(token) {
        return this.db(TOKEN_TABLE_NAME).where('token', token)
            .then((token) => {
                if (!token.length) {
                    return Promise.reject(new Exception(-5, 'Invalid token'));
                }
                token = token[0];
                if (moment().isAfter(token.expire)) {
                    return Promise.reject(new Exception(-6, 'Login expired'));
                }
                return this.queryUser(token.uid);
            })
            .catch((err) => {
                console.log(err);
                return Promise.reject(new Exception(-7, 'Database Error'));
            });
    }

    /**
     * @param token
     *
     * @return Promise resolve to nothing
     */
    logout(token) {
        return this.db(TOKEN_TABLE_NAME).where('token', token).update({
            expire: moment().subtract(1, 'days').format('YYYY-MM-DD')
        })
        .catch((err) => {
            console.log(err);
            return Promise.reject(new Exception(-8, 'Database Error'));
        });
    }

    checkoutMoney(uid, balance) {
        balance = (balance * 100) | 0;
        return this.getUser(uid)
            .then((user) => {
                if (user.balance < balance) {
                    return Promise.reject(new Exception(-7, 'No enough money'))
                }
                return this.db(TABLE_NAME).update({balance: user.balance - balance}).where('id', uid);
            });
    }

    checkinMoney(uid, balance) {
        balance = (balance * 100) | 0;
        return this.db(TABLE_NAME).where('id', uid).increment('balance', balance);
    }
}

module.exports = User;
