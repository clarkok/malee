'use strict';

let sha1 = require('sha1');

function _randomString(length, ALPHABET) {
    let ret = '';
    while (length --) {
        ret += ALPHABET[(Math.random() * ALPHABET.length) | 0];
    }

    return ret;
}

function randomString(length) {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return _randomString(length, ALPHABET);
}

function randomNumberString(length) {
    const ALPHABET = '0123456789';
    return _randomString(length, ALPHABET);
}

function chineseCut(str, sp) {
    sp = sp || ' ';
    return str.replace(/([\u4e00-\u9fa5])/g, `$1${sp}`);
}

function chineseCutObject(obj) {
    return Object.getOwnPropertyNames(obj).reduce(
        (prev, name) => {
            if (typeof(obj[name]) == 'string') {
                prev[name] = chineseCut(obj[name]);
            }
            else {
                prev[name] = obj[name];
            }
            return prev;
        },
        {}
    );
}

exports.randomString = randomString;
exports.randomNumberString = randomNumberString;
exports.sha1 = sha1;
exports.chineseCut = chineseCut;
exports.chineseCutObject = chineseCutObject;
