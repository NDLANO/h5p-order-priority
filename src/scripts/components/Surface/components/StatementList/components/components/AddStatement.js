import React from 'react';
import PropTypes from 'prop-types';
import './AddStatement.scss';

/**
 * Adds a button to add new statements
 * @param {object} props React props.
 * @returns {object} JSX element.
 */
const AddStatement = (props) => {
  const {
    translations,
    onClick
  } = props;

  return (
    <div>
      <button
        type={'button'}
        className={'h5p-order-priority-add'}
        onClick={onClick}
      >
        <span>
          <span className={'h5p-ri hri-pencil'} />
          <span>{translations.add}</span>
        </span>
      </button>
    </div>
  );
};

AddStatement.propTypes = {
  translations: PropTypes.object,
  onClick: PropTypes.func,
};

export default AddStatement;
