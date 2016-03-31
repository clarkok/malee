'use strict';

import React from 'react';

import { connect } from 'react-redux';

import SearchBox from './search-bar.jsx';
import { exitShop } from './actions.js';

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
            </header>
        )
    },
    handleBack: function () {
        this.props.dispatch(exitShop());
    }
});

const mapStateToProps = (state) => {
    return { presenting: state.presenting }
}

export default connect(mapStateToProps)(Header);
