import { useDroppable } from '@dnd-kit/core';
import React from 'react';

/**
 * Droppable element.
 * @param {object} props React props.
 * @param {string} props.id Id of droppable.
 * @param {object} props.children React children.
 * @param {boolean} props.isDropDisabled If true, dropping is not possible.
 * @returns {object} JSX element.
 */
const Droppable = ({ id, children, isDropDisabled }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { droppableId: id },
    disabled: isDropDisabled,
  });

  // TODO: Shouldn't isOver react to the parent container? Fix with DnDKit fix

  return (
    <div
      className={`h5p-order-priority-dropzone-wrapper${isOver ? ' hover' : ''}`}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export default Droppable;
