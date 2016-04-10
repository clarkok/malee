'use strict';

import React from 'react';

import { connect } from 'react-redux';

import SearchBox from './search-bar.jsx';
import { exitShop, exitShopInsist, loginRequest, exitSearch } from './actions.js';

let HeaderLoginning = React.createClass({
    render: function () {
        return (<span className="header-right header-loginning"><i className="fa fa-circle-o-notch" /></span>);
    }
});

let HeaderLogined = React.createClass({
    render: function () {
        return (
            <span className="header-right header-logined">
                <span className="header-nickname">{this.props.nickname}</span>
            </span>
        );
    }
});

let HeaderLogin = React.createClass({
    render: function () {
        return (
            <span onClick={this.props.onClick} className="header-right header-login">登录</span>
        );
    }
});

let Header = React.createClass({
    render: function () {
        return (
            <header className={`${this.props.presenting == 'SHOPS' ? '' : 'subheader'}`}>
                <i
                    id="header-back"
                    className="fa fa-angle-left"
                    onClick={this.handleBack}
                />
                <h1 id="header-title" className="header-item">MALEE</h1>
                <SearchBox />
                {
                    (this.props.loginning || this.props.validating) ? <HeaderLoginning />       :
                    this.props.validated ? <HeaderLogined nickname={this.props.nickname} />     :
                                           <HeaderLogin onClick={this.handleLogin} />
                }
            </header>
        )
    },
    handleBack: function () {
        if (this.props.presenting == 'ITEMS') {
            this.props.dispatch( this.props.safeBack ? exitShopInsist() : exitShop() );
        }
        else if (this.props.presenting == 'SEARCH') {
            console.log("exit search");
            this.props.dispatch(exitSearch());
        }
    },
    handleLogin: function () {
        this.props.dispatch(loginRequest());
    }
});

const mapStateToProps = (state) => {
    return {
        presenting: state.presenting,
        safeBack: !state.cart.shop_id,
        validating: state.user.validating,
        validated: state.user.validated,
        loginning: state.user.loginning,
        logined: state.user.logined,
        nickname: state.user.nickname || ''
    };
}

export default connect(mapStateToProps)(Header);
