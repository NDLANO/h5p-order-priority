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

  return (
    <div
      className="h5p-category-task-droppable"
      style={isOver ? { backgroundColor: '#E0E7F0' } : undefined}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export default Droppable;
