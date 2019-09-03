import React from 'react';
import PropTypes from 'prop-types';

function UnEditableStatement(props) {
    return (
        <div className={"h5p-order-priority-element"}>
            {props.statement}
        </div>
    );
}

UnEditableStatement.propTypes = {
    statement: PropTypes.string,
};

export default UnEditableStatement;