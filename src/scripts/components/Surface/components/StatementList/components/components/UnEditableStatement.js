import React from 'react';
import PropTypes from 'prop-types';

function UnEditableStatement(props) {
  return (
    <p className={'h5p-order-priority-element'}>
      {props.statement}
    </p>
  );
}

UnEditableStatement.propTypes = {
  statement: PropTypes.string,
};

export default UnEditableStatement;