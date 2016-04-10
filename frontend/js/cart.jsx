'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { connect } from 'react-redux';

import { exitShopInsist, exitShopCancel, loginCancel, login } from './actions.js';
import { doLogin } from './api.js';

const TRANSITION_DURATION = 300;

let CartListItem = React.createClass({
    render: function () {
        return (
            <li className="cart-item">
                <span className="cart-item-column cart-item-name">{this.props.item.name}</span>
                <span className="cart-item-column cart-item-price">{this.props.item.price}</span>
                <span className="cart-item-column cart-item-number">{this.props.number}</span>
                <span className="cart-item-column cart-item-equal">=</span>
                <span className="cart-item-column cart-item-total">{this.props.item.price * this.props.number}</span>
            </li>
        );
    }
});

let CartList = React.createClass({
    render: function () {
        return (
            <ol className="cart-list">
                <ReactCSSTransitionGroup
                    transitionName="cart-list"
                    transitionEnterTimeout={TRANSITION_DURATION}
                    transitionLeaveTimeout={TRANSITION_DURATION}
                >
                    {
                        this.props.itemsList.map(
                            (itemList) =>
                                <CartListItem key={itemList.item.id} item={itemList.item} number={itemList.number} />
                        )
                    }
                </ReactCSSTransitionGroup>
            </ol>
        );
    }
});

let CartBottomLinePromote = React.createClass({
    render: function () {
        return (
            <div className="cart-bottom-line">
                <span>返回后订单会被重置，确认返回？</span>
                <span onClick={this.props.onInsistExit} className="cart-button">返回</span>
                <span onClick={this.props.onCancelExit} className="cart-button">取消</span>
            </div>
        );
    }
});

let CartBottomLineConfirm = React.createClass({
    render: function () {
        return (
            <div className="cart-bottom-line">
                <span onClick={this.props.onSubmit} className="cart-button">立即下单</span>
            </div>
        );
    }
});

let CartBottomLineLogin = React.createClass({
    render: function () {
        return (
            <div className={`cart-bottom-line cart-bottom-line-login ${this.state.login_error ? 'login-error' : ''}`}>
                <form className="cart-bottom-line-login-form" action="javascript:void(0)" onSubmit={this.handleLogin}>
                    <div className="cart-bottom-line-login-line">
                        <label htmlFor="login-username">用户名</label>
                        <input
                            className="cart-bottom-line-login-input"
                            type="text"
                            name="username"
                            id="login-username"
                            placeholder="用户名"
                            onChange={(evt) => this.setState({username: evt.target.value, login_error: false})}
                        />
                    </div>
                    <div className="cart-bottom-line-login-line">
                        <label htmlFor="login-password">密码</label>
                        <input
                            className="cart-bottom-line-login-input"
                            type="password"
                            name="password"
                            id="login-password"
                            placeholder="密码"
                            onChange={(evt) => this.setState({password: evt.target.value, login_error: false})}
                        />
                    </div>
                    <div className="cart-bottom-line-login-line">
                        <span className="cart-bottom-line-login-button left" onClick={this.props.onLoginCancel}>取消</span>
                        <button className="cart-bottom-line-login-button" onClick={this.handleLogin}>登录</button>
                        <span className="cart-bottom-line-login-button" onClick={this.handleRegister}>注册</span>
                    </div>
                </form>
            </div>
        )
    },
    getInitialState: function () {
        return {
            username: '',
            password: '',
            login_error: this.props.loginError
        }
    },
    componentWillReceiveProps: function (next_props) {
        this.setState({
            login_error: next_props.loginError
        });
    },
    handleLogin: function () {
        this.props.onLogin(this.state.username, this.state.password);
    },
    handleRegister: function () {
        this.props.onRegister(this.state.username, this.state.password);
    }
});

let Cart = React.createClass({
    render: function () {
        let extra_state = 
                        this.props.login   ?    'login'     :
                        this.props.promote ?    'promote'   :
                        this.props.shop_id ?    'show'      :
                                                'hidden';
        return (
            <div id="cart" className={`${extra_state}-cart`}>
                <h3>
                    {this.props.shop.name || " "}
                    <span className="cart-total">{this.props.total}</span>
                </h3>
                <CartList itemsList={this.props.itemsList} />
                <ReactCSSTransitionGroup
                    transitionName="cart-bottom-line"
                    transitionEnterTimeout={TRANSITION_DURATION}
                    transitionLeaveTimeout={TRANSITION_DURATION}
                >
                    {
                        this.props.login    ? <CartBottomLineLogin
                                                key="login"
                                                loginError={this.props.login_error}
                                                onLogin={this.handleLogin}
                                                onRegister={this.handleRegister}
                                                onLoginCancel={this.handleLoginCancel} /> :
                        this.props.promote  ? <CartBottomLinePromote
                                                key="promote"
                                                onInsistExit={this.handleInsist}
                                                onCancelExit={this.handleCancel} />
                                            : <CartBottomLineConfirm
                                                key="confirm"
                                                onSubmit={this.handleSubmit} />
                    }
                </ReactCSSTransitionGroup>
            </div>
        );
    },
    handleCancel: function () {
        this.props.dispatch(exitShopCancel());
    },
    handleInsist: function () {
        this.props.dispatch(exitShopInsist());
    },
    handleSubmit: function () {
    },
    handleLoginCancel: function () {
        this.props.dispatch(loginCancel());
    },
    handleLogin: function (username, password) {
        this.props.dispatch(login(doLogin(username, password)));
    },
    handleRegister: function (username, password) {
    }
});

const mapStateToProps = (state) => {
    let itemsList = Object.getOwnPropertyNames(state.cart)
                        .filter((name) => !isNaN(parseInt(name, 10)))
                        .map((name) => { return {item: state.items[name], number: state.cart[name]} });
    let total = itemsList.reduce((total, itemList) => { return total + itemList.number * itemList.item.price }, 0)
    return {
        shop_id: state.cart.shop_id,
        shop: state.cart.shop_id ? state.shops[state.cart.shop_id] : {},
        promote: state.cart.promote,
        login: state.cart.login,
        login_error: state.user.login_error,
        itemsList, total
    };
}

export default connect(mapStateToProps)(Cart);
