'use strict';

export function obj2form(obj) {
    return Object.getOwnPropertyNames(obj).reduce(
        (form, key) => {form.append(key, obj[key]); return form;},
        new FormData()
    );
}

export function obj2query(obj) {
    return Object.getOwnPropertyNames(obj).map((key) => `${key}=${encodeURIComponent(obj[key])}`).join('&');
}

export function queryUrl(base, queries) {
    return `${base}?${obj2query(queries)}`;
}

export function get(url) {
    return fetch(url, {credentials: 'include'}).then((res) => res.json());
}

export function post(url, data) {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: obj2query(data || {})
    }).then((res) => res.json());
}
