'use strict';

import React from 'react';

let SearchBox = React.createClass({
    render: function () {
        return (
            <form id="search-bar" className="header-item">
                <input className="search-input" name="q" type="text" />
                <button className="search-button"><i className="fa fa-search" /></button>
            </form>
        )
    }
});

export default SearchBox;
