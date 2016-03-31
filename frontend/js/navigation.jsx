'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { connect } from 'react-redux';

import ShopList from './shop-list.jsx';
import Shop from './shop.jsx';

const TRANSITION_DURATION = 500;

let Navigation = React.createClass({
    render: function () {
        let scene;

        switch (this.props.presenting) {
            case 'ITEMS':
                scene = <Shop key={`ITEMS-${this.props.currentShop}`} />;
                break;
            case 'SHOPS':
            default:
                scene = <ShopList key="SHOPS" />;
        };

        return (
            <div className="container">
                <ReactCSSTransitionGroup
                    transitionName="scene"
                    transitionEnterTimeout={TRANSITION_DURATION}
                    transitionLeaveTimeout={TRANSITION_DURATION}
                >
                    {scene}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
});

const mapStateToProps = (state) => {
    return {
        presenting: state.presenting,
        currentShop: state.currentShop
    };
}

export default connect(mapStateToProps)(Navigation);
