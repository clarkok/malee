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

export const VERIFY_LOGIN           = 'VERIFY_LOGIN';
export function verifyLogin(promise) {
    return {
        type: VERIFY_LOGIN,
        promise
    };
}

export const LOGIN_REQUEST          = 'LOGIN_REQUEST';
export function loginRequest() {
    return {
        type: LOGIN_REQUEST
    };
}

export const LOGIN_CANCEL           = 'LOGIN_CANCEL';
export function loginCancel() {
    return {
        type: LOGIN_CANCEL
    };
}

export const LOGIN                  = 'LOGIN';
export function login(promise) {
    return {
        type: LOGIN,
        promise
    };
}

export const REGISTER               = 'REGISTER';
export function register(promise) {
    return {
        type: REGISTER,
        promise
    };
}

export const SEARCH                 = 'SEARCH';
export function search(query, promise) {
    return {
        type: SEARCH,
        query, promise
    };
}

export const EXIT_SEARCH            = 'EXIT_SEARCH';
export function exitSearch() {
    return {
        type: EXIT_SEARCH
    };
}
