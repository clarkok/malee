'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Aside from './aside.jsx';
import Header from './header.jsx';
import Navigation from './navigation.jsx';
import Cart from './cart.jsx';

import store from './store.js';
import { pullShopListPage, verifyLogin } from './actions.js';
import { fetchShopListPage, fetchUserInfo } from './api.js';

store.dispatch(pullShopListPage(fetchShopListPage()));
store.dispatch(verifyLogin(fetchUserInfo()));

let App = React.createClass({
    render: function () {
        return (
            <div>
                <Header />
                <Navigation />
                <Cart />
            </div>
        );
    }
});

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('wrapper')
);
