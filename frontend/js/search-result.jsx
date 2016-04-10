'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { connect } from 'react-redux';

import { selectShop } from './actions.js';

let SearchShopCard = React.createClass({
    render: function () {
        return (
            <li
                className="shop-card"
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

let SearchItemCard = React.createClass({
    render: function () {
        return (
            <li
                className="item-card"
                onClick={this.props.onClick}
            >
                <div className="item-card-inner">
                    <img className="item-photo" src={this.props.item.photo} alt={this.props.item.name} />
                    <h4 className="item-name">{this.props.item.name}</h4>
                    <p className="item-price">{this.props.item.price}</p>
                </div>
            </li>
        );
    }
});

let SearchResult = React.createClass({
    render: function () {
        console.log(this.props.result);
        return (
            <ol id="search-result" className="scene">
                { this.props.result.shops.length ? <span key="label-shop" className="gap">商店</span> : [] }
                {
                    this.props.result.shops.map(
                        (shop) => 
                            <SearchShopCard key={`SHOP-${shop.id}`} shop={shop} onClick={() => this.handleClick(shop.id)} />
                    )
                }
                { this.props.result.items.length ? <span key="label-item" className="gap">商品</span> : [] }
                {
                    this.props.result.items.map(
                        (item) =>
                            <SearchItemCard key={`ITEM-${item.id}`} item={item} onClick={() => this.handleClick(item.shop)} />
                    )
                }
            </ol>
        );
    },
    handleClick: function (shop_id) {
        this.props.dispatch(selectShop(shop_id));
    }
});

let mapStateToProps = (state) => {
    return {
        query: state.search.query,
        result: state.search.result
    }
}

export default connect(mapStateToProps)(SearchResult);
