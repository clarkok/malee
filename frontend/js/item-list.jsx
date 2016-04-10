'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { connect } from 'react-redux';

import { fetchItemListPage } from './api.js';
import { pullItemListPage, selectItem } from './actions.js';

import ListFooter from './list-footer.jsx';

const TRANSITION_DURATION = 300;
const DELAY_BETWEEN_CARD = 50;
const CARDS_PER_PAGE = 8;

let Item = React.createClass({
    getInitialState: function () {
        return {
            number: 0,
            selected: false
        }
    },

    render: function () {
        return (
            <li className="item-card">
                <div className={`item-card-inner ${this.state.selected ? "selected" : ""}`}>
                    <img className="item-photo" src={this.props.item.photo} alt={this.props.item.name} />
                    <h4 className="item-name">{this.props.item.name}</h4>
                    <p className="item-price">{this.props.item.price}</p>
                    <form className="item-number" onSubmit={(e) => { e.preventDefault(); return false; }}>
                        <span
                            className="item-number-button dec"
                            onClick={this.handleDec}
                        >-</span>
                        <input
                            onChange={this.handleNumberChange}
                            onFocus={this.handleInputFocus}
                            onBlur={this.handleInputBlur}
                            className="item-number-input"
                            type="text"
                            value={this.state.number}
                        />
                        <span
                            className="item-number-button inc"
                            onClick={this.handleInc}
                        >+</span>
                    </form>
                </div>
            </li>
        );
    },

    changeNumber: function (new_number) {
        if (new_number < 0) { new_number = 0 }

        this.setState({
            number: new_number,
            selected: !!new_number
        });

        this.props.onNumberChange(this.props.item.id, new_number);
    },

    handleNumberChange: function (event) {
        let new_number = parseInt(event.target.value, 10) || 0;
        this.changeNumber(new_number);
    },

    handleInputFocus: function () {
        this.setState({
            selected: true
        });
    },

    handleInputBlur: function () {
        this.setState({
            selected: !!this.state.number
        });
    },

    handleInc: function () { this.changeNumber(this.state.number + 1) },

    handleDec: function () { this.changeNumber(this.state.number - 1) }
});

let ItemList = React.createClass({
    render: function () {
        return (
            <ol className={`item-list ${this.props.cartFloat ? 'item-reserve-for-cart' : ''}`} ref="items">
                <ReactCSSTransitionGroup
                    transitionName="item-card"
                    transitionEnterTimeout={TRANSITION_DURATION}
                    transitionLeaveTimeout={TRANSITION_DURATION}
                >
                    {
                        this.props.items
                            .filter((item, index) => index < this.state.rendered)
                            .map(
                                (item, index) =>
                                    <Item
                                        key={item.id}
                                        item={item}
                                        onNumberChange={this.handleNumberChange}
                                    />
                            )
                    }
                </ReactCSSTransitionGroup>
                <ListFooter fetching={this.props.fetching} ended={this.props.ended} />
            </ol>
        );
    },
    getInitialState: function () {
        return {
            rendered: 0,
            showing: false
        };
    },
    componentDidMount: function () {
        if (!this.props.items.length) {
            this.props.dispatch(pullItemListPage(
                this.props.shopId,
                fetchItemListPage(this.props.shopId, this.props.itemLastId)
            ));
        }
        else {
            setTimeout(this.showNext, DELAY_BETWEEN_CARD);
        }

        this.props.addScrollListener(this.handleScroll);
    },
    componentWillUnmount: function () {
        this.props.removeScrollListener(this.handleScroll);
    },
    componentWillReceiveProps: function (nextProps) {
        if (!this.state.showing) {
            setTimeout(this.showNext, DELAY_BETWEEN_CARD);
        }
    },
    showNext: function () {
        let rendered = this.state.rendered + 1;
        if (rendered > this.props.items.length) {
            this.setState({ showing: false });
        }
        else {
            this.setState({ showing: true, rendered });
            setTimeout(this.showNext, DELAY_BETWEEN_CARD);
        }
    },
    handleScroll: function (scrollTop) {
        if (scrollTop + window.innerHeight > this.refs.items.clientHeight) {
            if (!this.props.fetching && !this.props.ended) {
                this.props.dispatch(
                    pullItemListPage(
                        this.props.shopId,
                        fetchItemListPage(
                            this.props.shopId,
                            this.props.itemLastId
                        )
                    )
                );
            }
        }
    },
    handleNumberChange: function (item_id, number) {
        this.props.dispatch(selectItem(this.props.shopId, item_id, number));
    }
});

const mapStateToProps = (state) => {
    return {
        itemLastId: state.shops[state.currentShop].itemLastId,
        fetching: state.shops[state.currentShop].itemFetching,
        error: state.shops[state.currentShop].itemError,
        ended: state.shops[state.currentShop].itemEnded,
        shopId: state.currentShop,
        cartFloat: !!state.cart.shop_id,
        items: Object.getOwnPropertyNames(state.items)
                    .filter((name) => !isNaN(parseInt(name, 10)))
                    .map((name) => state.items[name])
                    .filter((item) => item.shop == state.currentShop)
    }
}

export default connect(mapStateToProps)(ItemList);
