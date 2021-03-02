import React from 'react';
import {useOrderPriority} from "context/OrderPriorityContext";

function DragArrows({draggableProps}) {
  const context = useOrderPriority();

  return (
    <div
      className={"h5p-order-priority-drag-element"}
      {...draggableProps}
      role={"button"}
    >
      <span
        className="h5p-ri hri-move"
      />
      <p className={"visible-hidden"}>{context.translations.draggableItem}</p>
    </div>
  );
}

export default DragArrows;