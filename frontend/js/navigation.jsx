'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { connect } from 'react-redux';

import ShopList from './shop-list.jsx';
import Shop from './shop.jsx';
import SearchResult from './search-result.jsx';

const TRANSITION_DURATION = 800;

let Scroller = React.createClass({
    render: function () {
        return <div className="scroller">{children}</div>
    }
});

let Navigation = React.createClass({
    render: function () {
        let scene;
        let key;

        switch (this.props.presenting) {
            case 'ITEMS':
                key = `ITEMS-${this.props.currentShop}`;
                scene = <Shop
                            key={key}
                            addScrollListener={this.addScrollListener}
                            removeScrollListener={this.removeScrollListener}
                         />;
                break;
            case 'SEARCH':
                key = `SEARCH-${this.props.query}`;
                scene = <SearchResult key={key} />
                break;
            case 'SHOPS':
            default:
                key = 'SHOPS';
                scene = <ShopList
                            key={key}
                            addScrollListener={this.addScrollListener}
                            removeScrollListener={this.removeScrollListener}
                        />;
        };

        return (
            <ReactCSSTransitionGroup
                transitionName="scene"
                transitionEnterTimeout={TRANSITION_DURATION}
                transitionLeaveTimeout={TRANSITION_DURATION}
            >
                <div className="scroller" onScroll={this.handleScroll} key={key}>{scene}</div>
            </ReactCSSTransitionGroup>
        );
    },
    getInitialState: function () {
        return {
            _scroll_handlers: []
        };
    },
    addScrollListener: function (listener) {
        this.state._scroll_handlers.push(listener);
    },
    removeScrollListener: function (listener) {
        this.state._scroll_handlers = this.state._scroll_handlers.filter((handlers) => handlers != listener);
    },
    handleScroll: function (evt) {
        let scrollTop = evt.target.scrollTop;
        this.state._scroll_handlers.forEach((handler) => {
            handler(scrollTop);
        });
    }
});

const mapStateToProps = (state) => {
    return {
        presenting: state.presenting,
        currentShop: state.currentShop,
        query: state.search.query
    };
}

export default connect(mapStateToProps)(Navigation);
