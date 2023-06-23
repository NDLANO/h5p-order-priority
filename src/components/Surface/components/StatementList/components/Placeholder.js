import React from 'react';
import PriorityNumber from './components/PriorityNumber';
import classnames from 'classnames';

/**
 * Serves as a placeholder in the prioritized column
 *
 * @param displayIndex
 * @param children
 * @param isDraggingOver
 * @return {*}
 * @constructor
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
