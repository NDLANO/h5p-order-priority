import React from 'react';
import PropTypes from 'prop-types';

/**
 * Container with the number indicating what priority a statement has
 * @param props
 * @return {*}
 * @constructor
 */
function PriorityNumber(props) {
  const {
    displayIndex
  } = props;
  return (
    <div 
      className={"h5p-order-priority-number h5p-order-priority-number-" + displayIndex}
      aria-hidden={true}
    >
      <div>{displayIndex}</div>
    </div>
  );
}

PriorityNumber.propTypes = {
  displayIndex: PropTypes.number,
};

export default PriorityNumber;