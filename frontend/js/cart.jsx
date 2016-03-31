'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { connect } from 'react-redux';

import { exitShopInsist, exitShopCancel } from './actions.js';

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

let Cart = React.createClass({
    render: function () {
        let extra_state = 
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
                        this.props.promote
                            ? (
                                <div className="cart-bottom-line" key="promote">
                                    <span>返回后订单会被重置，确认返回？</span>
                                    <span onClick={this.handleInsist} className="cart-button">确认</span>
                                    <span onClick={this.handleCancel} className="cart-button">取消</span>
                                </div>
                            )
                            : (
                                <div className="cart-bottom-line" key="confirm">
                                    <span onClick={this.handleSubmit} className="cart-button">立即下单</span>
                                </div>
                            )
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
        itemsList, total
    };
}

export default connect(mapStateToProps)(Cart);
