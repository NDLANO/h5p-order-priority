import React from 'react';
import PropTypes from 'prop-types';
import './PriorityNumber.scss';

/**
 * Container with number indicating what priority a statement has.
 * @param {object} props React props.
 * @returns {object} JSX element.
 */
const PriorityNumber = (props) => {
  const {
    displayIndex
  } = props;

  return (
    <div
      className={'h5p-order-priority-number h5p-order-priority-number-' + displayIndex}
    >
      <div
        className='h5p-order-priority-number-circle'
      >
        {displayIndex}
      </div>
    </div>
  );
};

PriorityNumber.propTypes = {
  displayIndex: PropTypes.number,
};

export default PriorityNumber;
