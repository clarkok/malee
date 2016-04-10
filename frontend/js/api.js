'use strict';

import { queryUrl, obj2query } from './utils';
import cookie from 'react-cookie';
import Promise from 'bluebird';

export function fetchShopListPage(page_start, page_count) {
    page_start = page_start || 0;
    page_count = page_count || 10;

    return fetch(queryUrl('/shop', { page_start, page_count })).then(result => result.json());
}

export function fetchItemListPage(shop_id, page_start, page_count) {
    page_start = page_start || 0;
    page_count = page_count || 8;

    return fetch(queryUrl(`/shop/${shop_id}/items`, { page_start, page_count })).then(result => result.json());
}

export function fetchShopDetail(shop_id) {
    return fetch(`/shop/${shop_id}`).then(result => result.json());
}

export function fetchUserInfo() {
    return fetch('/user', { credentials: 'include' }).then(result => result.json());
}

export function doLogin(username, password) {
    return fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: obj2query({username, password})
    }).then((res) => res.json())
    .then((data) => {
        if (data.code == 0) {
            cookie.save('token', data.token, {
                path: '/',
                maxAge: 7 * 24 * 3600
            });
        }
        else {
            cookie.remove('token', {
                path: '/'
            });
        }

        return Promise.resolve(data);
    })
}

export function doSearch(q) {
    return fetch(queryUrl('/search', { q })).then(result => result.json());
}
