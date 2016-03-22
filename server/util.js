'use strict';

let sha1 = require('sha1');

function randomString(length) {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let ret = '';
    while (length --) {
        ret += ALPHABET[(Math.random() * ALPHABET.length) | 0];
    }

    return ret;
}

exports.randomString = randomString;
exports.sha1 = sha1;
