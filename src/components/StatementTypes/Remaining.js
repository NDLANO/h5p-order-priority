import React from 'react';
import PropTypes from 'prop-types';

const Remaining = props => {
    const {
        statement
    } = props;

    return (
        <div
            className="h5p-order-priority-statement"
        >
            <div>
                <div className={"h5p-order-priority-drag-element"}>
                    <i className="fa fa-arrows" />
                </div>
                {statement}
            </div>
        </div>
    );

};

Remaining.propTypes = {
    statement: PropTypes.string,
};

export default Remaining;
