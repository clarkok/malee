'use strict';

import React from 'react';

import { connect } from 'react-redux';

import { fetchShopDetail } from './api.js';
import { pullShopDetail } from './actions.js';

import ItemList from './item-list.jsx';

let ShopInfo = React.createClass({
    render: function () {
        return (
            <div className={`shop-info ${this.props.fetching ? "shop-info-fetching" : ""}`}>
                <img className="shop-photo" src={this.props.shop.photo} alt={this.props.shop.name} />
                <h3 className="shop-name">{this.props.shop.name || "No Name"}</h3>
                <p className="shop-phone">{this.props.shop.phone || "No Phone"}</p>
                <p className="shop-address">{this.props.shop.address || "No Address"}</p>
                <p className="shop-desc">{this.props.shop.desc || "No Description"}</p>
            </div>
        );
    }
});

let Shop = React.createClass({
    render: function () {
        return (
            <div id="shop" className="scene">
                <ShopInfo fetching={this.props.shop.detailFetching} shop={this.props.shop.detail || {}} />
                <ItemList items={this.props.items} />
            </div>
        );
    },
    componentDidMount: function () {
        if (!this.props.shop.detail) {
            this.props.dispatch(pullShopDetail(this.props.shopId, fetchShopDetail(this.props.shopId)));
        }
    }
});

const mapStateToProps = (state) => {
    return {
        shopId: state.currentShop,
        shop: state.shops[state.currentShop],
    }
}

export default connect(mapStateToProps)(Shop);
