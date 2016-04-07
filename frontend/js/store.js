'use strict';

import * as Actions from './actions';
import { combineReducers, createStore, applyMiddleware } from 'redux';

/**
 *  state {
 *      presenting: 'SHOPS' | 'ITEMS' | 'SEARCH_RESULTS',
 *      currentShop,
 *      shopLastId,
 *      shops: {
 *          fetching,
 *          error,
 *          ended,
 *          [id]: {
 *              id,
 *              name,
 *              photo,
 *              phone,
 *              address,
 *
 *              detailFetching,
 *              detail {
 *                  ...
 *              }
 *              itemFetching,
 *              itemError,
 *              itemEnded,
 *              itemLastId,
 *          },
 *          ...
 *      },
 *      items: {
 *          [id]: {
 *              id,
 *              shop,
 *              name,
 *              desc,
 *              price,
 *              photo
 *          },
 *          ...
 *      },
 *      cart: {
 *          shop_id,
 *          promote,
 *          login,
 *          [item_id]: [number]
 *      },
 *      user: {
 *          validating,
 *          validated,
 *          logining,
 *          logined,
 *          ...
 *      }
 *  }
 */

function presenting(state = 'SHOPS', action) {
    switch (action.type) {
        case Actions.SELECT_SHOP:
            return 'ITEMS';
        case Actions.EXIT_SHOP_INSIST:
            return 'SHOPS';
        default:
            return state;
    }
}

function currentShop(state = 0, action) {
    switch (action.type) {
        case Actions.SELECT_SHOP:
            return action.shop_id;
        default:
            return state;
    }
}

function shopLastId(state = 0, action) {
    switch (action.type) {
        case Actions.PULL_SHOP_LIST_PAGE:
            {
                return ((action.ready && !action.error && action.result.shops.length) 
                    ? action.result.shops[action.result.shops.length - 1].id + 1
                    : state);
            }
        default:
            return state;
    }
}

function shops(state = {}, action) {
    switch (action.type) {
        case Actions.PULL_SHOP_LIST_PAGE:
            {
                return Object.assign(
                    {},
                    state,
                    { fetching: !action.ready },
                    { error: action.error || false },
                    { ended: action.ready ? !action.result.shops.length : state.ended },
                    action.ready 
                        ? ( 
                            action.error 
                                ? { error : action.error } 
                                : action.result.shops.reduce(
                                    (map, shop) => {
                                        shop.detailFetching = false;
                                        shop.detail = undefined;
                                        shop.itemLastId = 0;
                                        map[shop.id] = shop;
                                        return map
                                    },
                                    {}
                                )
                          )
                        : {}
                );
            }
        case Actions.PULL_SHOP_DETAIL:
            {
                let new_state = Object.assign({}, state);
                new_state[action.shop_id].detailFetching = !action.ready;
                new_state[action.shop_id].detail = action.result && action.result.shop;

                if (action.ready) {
                    new_state[action.shop_id] = Object.assign({}, new_state[action.shop_id]);
                }

                return new_state;
            }
        case Actions.PULL_ITEM_LIST_PAGE:
            {
                let new_state = Object.assign({}, state);
                new_state[action.shop_id].itemFetching = !action.ready;
                if (action.ready) {
                    new_state[action.shop_id].itemEnded = !action.result.items.length;
                }
                new_state[action.shop_id].itemError = action.error;
                if (action.ready && !action.error && action.result.items.length) {
                    new_state[action.shop_id].itemLastId = action.result.items[action.result.items.length - 1].id + 1;
                }

                return new_state;
            }
        default:
            return state;
    }
}

function items(state = {}, action) {
    switch (action.type) {
        case Actions.PULL_ITEM_LIST_PAGE:
            {
                return Object.assign(
                    {},
                    state,
                    action.ready && !action.error
                        ? (
                            action.result.items.reduce(
                                (map, item) => {
                                    map[item.id] = item;
                                    return map;
                                },
                                {}
                            )
                          )
                        : {}

                );
            }
        default:
            return state;
    }
}

function cart(state={}, action) {
    switch (action.type) {
        case Actions.SELECT_ITEM:
            {
                let new_state = Object.assign(
                    {},
                    state,
                    { [action.item_id]: action.number }
                );

                if (!new_state[action.item_id]) {
                    delete new_state[action.item_id];

                    if (Object.getOwnPropertyNames(new_state).filter((name) => !isNaN(parseInt(name, 10))) == 0) {
                        new_state.shop_id = 0;
                    }
                }
                else {
                    new_state.shop_id = action.shop_id;
                }

                return new_state;
            }
        case Actions.EXIT_SHOP:
            {
                return Object.assign(
                    {},
                    state,
                    { promote: true }
                );
            }
        case Actions.EXIT_SHOP_INSIST:
            {
                return {
                    shop_id: 0,
                    promote: false
                }
            }
        case Actions.EXIT_SHOP_CANCEL:
            {
                return Object.assign(
                    {},
                    state,
                    { promote: false }
                );
            }
        case Actions.LOGIN_REQUEST:
            {
                return Object.assign(
                    {},
                    state,
                    { login: true }
                );
            }
        case Actions.LOGIN_CANCEL:
            {
                return Object.assign(
                    {},
                    state,
                    { login: false }
                );
            }
        default:
            return state;
    }
}

function user(state={}, action) {
    switch (action.type) {
        case Actions.VERIFY_LOGIN:
            {
                return Object.assign(
                    {},
                    state,
                    {
                        validating: !action.ready,
                        validated: !action.error && action.ready && action.result.code == 0
                    },
                    (action.ready && action.result.code == 0) ? action.result.user : {}
                );
            }
        case Actions.LOGIN:
            {
                return Object.assign(
                    {},
                    state,
                    {
                        loginning: !action.ready,
                        logined: action.ready && !action.error && action.result.code == 0
                    }
                );
            }
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    presenting,
    currentShop,
    shopLastId,
    shops,
    items,
    cart,
    user
});

const logger = store => next => action => {
    console.group(action.type);
    console.info('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    console.groupEnd(action.type);
    return result;
}

const readyStatePromise = store => next => action => {
    if (!action.promise) {
        return next(action);
    }

    function makeAction(ready, data) {
        let new_action = Object.assign({}, action, { ready }, data);
        delete new_action.promise;
        return new_action;
    }

    next(makeAction(false));
    return action.promise
        .then(result => next(makeAction(true, { result })))
        .catch(error => next(makeAction(true, { error })));
}

let store = createStore(
    rootReducer,
    {
        presenting: 'SHOPS',
        cart: { shop_id: 0, promote: false, login: false },
        user: { validating: false, validated: false, loginning: false, logined: false }
    },
    applyMiddleware(
        readyStatePromise,
        logger
    )
);

export default store;
