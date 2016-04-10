'use strict';

import React from 'react';

import { connect } from 'react-redux';

import { search } from './actions.js';
import { doSearch } from './api.js';

let SearchBox = React.createClass({
    render: function () {
        return (
            <form id="search-bar" className="header-item">
                <input
                    className="search-input"
                    name="q"
                    type="text"
                    value={this.state.q}
                    onChange={(evt) => this.setState({q : evt.target.value, changed : true})}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                />
                <button className="search-button"><i className="fa fa-search" /></button>
            </form>
        )
    },
    getInitialState: function () {
        return {
            q: '',
            changed: false
        };
    },
    handleFocus: function () {
        this.state.interval = setInterval(this.fireSearch, 1000);
    },
    handleBlur: function () {
        clearInterval(this.state.interval);
        this.fireSearch();
    },
    fireSearch: function () {
        if (this.state.changed) {
            this.state.changed = false;
            this.props.dispatch(search(this.state.q, doSearch(this.state.q)));
        }
    }
});

const mapStateToProps = (state) => {
    return {};
}

export default connect(mapStateToProps)(SearchBox);
