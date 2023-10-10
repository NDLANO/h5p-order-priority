import React from 'react';
import classnames from 'classnames';
import PriorityNumber from './components/PriorityNumber.js';

/**
 * Placeholder in the prioritized column.
 * @param {object} params Parameters.
 * @param {number} params.displayIndex Display index.
 * @param {object} params.children React children.
 * @param {boolean} params.isDraggingOver If true, draggable is over placeholder.
 * @returns {object} JSX element.
 */
const Placeholder = ({
  displayIndex,
  children,
  isDraggingOver = false,
}) => {
  return (
    <div>
      <PriorityNumber
        displayIndex={displayIndex}
      />
      <div
        className={classnames('h5p-droparea', {
          'h5p-order-priority-active-droppable': isDraggingOver
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default Placeholder;
