'use strict';

import { queryUrl } from './utils';

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
