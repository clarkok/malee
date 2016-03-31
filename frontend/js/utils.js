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
