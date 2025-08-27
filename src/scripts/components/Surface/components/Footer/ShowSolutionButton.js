import React from 'react';
import PropTypes from 'prop-types';
import { useOrderPriority } from '@context/OrderPriorityContext.js';
import './ShowSolutionButton.scss';

/**
 * Show Solution button component.
 * @param {object} props Component props.
 * @param {function} props.showSolution Function to show the solution.
 * @returns {object} JSX element.
 */
const ShowSolutionButton = ({ showSolution }) => {
  const orderPriorityContext = useOrderPriority();
  const { translations } = orderPriorityContext;

  return (
    <button
      onClick={showSolution}
      className="h5p-order-priority-footer-button h5p-order-priority-button-show-solution"
    >
      <span className={'h5p-ri hri-show-solution'} />
      {translations.showSolution}
    </button>
  );
};

ShowSolutionButton.propTypes = {
  showSolution: PropTypes.func.isRequired,
};

export default ShowSolutionButton;
