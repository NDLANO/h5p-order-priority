import { useDroppable } from '@dnd-kit/core';
import React from 'react';

/**
 * @typedef {{
 *   id: string;
 *   children: React.ReactElement
 *   isDropDisabled: boolean;
 * }} Props
 */

/**
 * @param {Props} props
 *
 * @return {React.ReactElement}
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
