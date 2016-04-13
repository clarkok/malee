'use strict';

import { queryUrl, obj2query, get, post } from './utils';
import cookie from 'react-cookie';
import Promise from 'bluebird';

export function fetchShopListPage(page_start, page_count) {
    page_start = page_start || 0;
    page_count = page_count || 10;

    return get(queryUrl('/shop', { page_start, page_count }));
}

export function fetchItemListPage(shop_id, page_start, page_count) {
    page_start = page_start || 0;
    page_count = page_count || 8;

    return get(queryUrl(`/shop/${shop_id}/items`, { page_start, page_count }));
}

export function fetchShopDetail(shop_id) {
    return get(`/shop/${shop_id}`);
}

export function fetchUserInfo() {
    return get('/user');
}

export function doLogin(username, password) {
    return post('/user/login', {username, password})
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
        });
}

export function doSearch(q) {
    return get(queryUrl('/search', { q }));
}

export function submitOrder(shop_id, item_list) {
    return post(`/shop/${shop_id}/order`, { item_list: JSON.stringify(item_list) });
}

export function pay(order_id) {
    return post(`/order/${order_id}/pay`);
}

export function cancel(order_id) {
    return post(`/order/${order_id}/cancel`);
}
