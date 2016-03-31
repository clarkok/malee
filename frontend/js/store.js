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
 *      user: {
 *          validating,
 *          logined,
 *          ...
 *      }
 *  }
 */

function presenting(state = 'SHOPS', action) {
    switch (action.type) {
        case Actions.SELECT_SHOP:
            return 'ITEMS';
        case Actions.EXIT_SHOP:
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
                new_state[action.shop_id].itemError = action.error;
                if (action.ready && !action.error && action.result.items.length) {
                    new_state[action.shop_id].itemLastId = action.result.items[action.result.items.length - 1] + 1;
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

const rootReducer = combineReducers({
    presenting,
    currentShop,
    shopLastId,
    shops,
    items
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
    applyMiddleware(
        readyStatePromise,
        logger
    )
);

export default store;
