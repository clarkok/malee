'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const TRANSITION_DURATION = 1000;

let ListFooter = React.createClass({
    render: function () {
        return (
            <ReactCSSTransitionGroup
                transitionName="list-footer"
                transitionEnterTimeout={TRANSITION_DURATION}
                transitionLeaveTimeout={TRANSITION_DURATION}
            >
                {
                    this.props.fetching ? 
                        <div className="list-footer list-fetching" key="fetching">
                            <i className="fa fa-circle-o-notch" />
                        </div> :
                    this.props.ended ?
                        <div className="list-footer list-ended" key="ended">
                        </div>
                        : []
                }
            </ReactCSSTransitionGroup>
        );
    }
});

export default ListFooter;
