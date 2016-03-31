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

export const EXIT_SHOP_INSIST       = 'EXIT_SHOP_INSIST';
export function exitShopInsist() {
    return {
        type: EXIT_SHOP_INSIST
    };
}

export const EXIT_SHOP_CANCEL       = 'EXIT_SHOP_CANCEL';
export function exitShopCancel() {
    return {
        type: EXIT_SHOP_CANCEL
    };
}

export const SELECT_ITEM            = 'SELECT_ITEM';
export function selectItem(shop_id, item_id, number) {
    return {
        type: SELECT_ITEM,
        shop_id, item_id, number
    };
}
