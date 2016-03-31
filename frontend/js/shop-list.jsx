'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { connect } from 'react-redux';

import { selectShop, pullShopListPage } from './actions.js';
import { fetchShopListPage } from './api.js';

import ListFooter from './list-footer.jsx';

const DELAY_BETWEEN_CARD    = 50;
const CARDS_PER_PAGE        = 10;
const TRANSITION_DURATION   = 300;

let ShopCard = React.createClass({
    render: function () {
        return (
            <li
                className={`shop-card delay-${this.props.delay}`}
                onClick={this.props.onClick}
            >
                <img className="shop-photo" src={this.props.shop.photo} alt={this.props.shop.name} />
                <h3 className="shop-name">{this.props.shop.name}</h3>
                <p className="shop-phone">{this.props.shop.phone}</p>
                <p className="shop-address">{this.props.shop.address}</p>
            </li>
        );
    }
});

let ShopList = React.createClass({
    render: function () {
        return (
            <ol id="shops" className="scene" ref="shops">
                <ReactCSSTransitionGroup 
                    transitionName="shop-card"
                    transitionEnterTimeout={TRANSITION_DURATION + DELAY_BETWEEN_CARD * CARDS_PER_PAGE}
                    transitionLeaveTimeout={TRANSITION_DURATION + DELAY_BETWEEN_CARD * CARDS_PER_PAGE}
                >
                    {
                        this.state.shops
                            .map(
                                (shop, index) =>
                                    <ShopCard
                                        key={shop.id}
                                        delay={(index > this.state.delayBase) ? (index - this.state.delayBase) : 0}
                                        shop={shop} 
                                        onClick={this.handleCardClick.bind(this, shop.id)}
                                    />
                            )
                    }
                </ReactCSSTransitionGroup>
                <ListFooter fetching={this.props.shops.fetching} ended={this.props.shops.ended} />
            </ol>
        );
    },
    getInitialState: function () {
        return {
            shops: Object.getOwnPropertyNames(this.props.shops)
                        .filter((name) => !isNaN(parseInt(name, 10)))
                        .map((id) => this.props.shops[id]),
            delayBase: 0
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState({
            shops: Object.getOwnPropertyNames(nextProps.shops)
                        .filter((name) => !isNaN(parseInt(name, 10)))
                        .map((id) => nextProps.shops[id]),
            delayBase: this.state.shops.length
        });
    },
    componentDidMount: function () {
        this.props.addScrollListener(this.handleScroll);
    },
    componentWillUnmount: function () {
        this.props.removeScrollListener(this.handleScroll);
    },
    handleCardClick: function (shop_id) {
        this.props.dispatch(selectShop(shop_id));
    },
    handleScroll: function (scrollTop) {
        if (scrollTop + window.innerHeight > this.refs.shops.clientHeight) {
            if (!this.props.shops.fetching && !this.props.shops.ended) {
                this.props.dispatch(pullShopListPage(fetchShopListPage(this.props.shopLastId)));
            }
        }
    }
});

const mapStateToProps = (state) => {
    return {
        shops: state.shops,
        shopLastId: state.shopLastId
    }
}

export default connect(mapStateToProps)(ShopList);
