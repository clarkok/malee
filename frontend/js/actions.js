'use strict';

export const VALIDATE_LOGIN         = 'VALIDATE_LOGIN';
export function validateLogin(promise) {
    return {
        type: VALIDATE_LOGIN_FETCH,
        promise
    };
}

export const PULL_SHOP_LIST_PAGE    = 'PULL_SHOP_LIST_PAGE';
export function pullShopListPage(promise) {
    return {
        type: PULL_SHOP_LIST_PAGE,
        promise
    };
}

export const PULL_SHOP_DETAIL       = 'PULL_SHOP_DETAIL';
export function pullShopDetail(shop_id, promise) {
    return {
        type: PULL_SHOP_DETAIL,
        shop_id, promise
    };
}

export const PULL_ITEM_LIST_PAGE    = 'PULL_ITEM_LIST_PAGE';
export function pullItemListPage(shop_id, promise) {
    return {
        type: PULL_ITEM_LIST_PAGE,
        shop_id, promise
    };
}

export const SELECT_SHOP            = 'SELECT_SHOP';
export function selectShop(shop_id) {
    return {
        type: SELECT_SHOP,
        shop_id
    };
}

export const EXIT_SHOP              = 'EXIT_SHOP';
export function exitShop() {
    return {
        type: EXIT_SHOP
    };
}
