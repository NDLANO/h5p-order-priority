import React from 'react';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

function Column(props) {
  const {
    droppableId,
    combine,
    children,
    disableDrop,
    additionalClassName,
    addStatement,
  } = props;

  return (
    <div
      className={classnames(additionalClassName)}
    >
      <Droppable
        droppableId={droppableId}
        isDropDisabled={disableDrop}
      >
        {(provided, snapshot) => {
          return (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={classnames("h5p-order-priority-column", {
                "h5p-order-priority-drag-active": snapshot.isDraggingOver && snapshot.draggingFromThisWith === null
              })}
              //aria-label={"Provided statements"}
            >
              {children}
              <li style={{display: !combine ? "block" : "none"}}>
                {provided.placeholder}
              </li>
            </ul>
          );
        }}
      </Droppable>
      {addStatement}
    </div>
  );
}

Column.propTypes = {
  statements: PropTypes.array,
  droppableId: PropTypes.string.isRequired,
  combine: PropTypes.bool,
  disableDrop: PropTypes.bool,
  additionalClassName: PropTypes.string,
  addStatement: PropTypes.object,
};

Column.defaultProps = {
  droppableId: null,
  combine: false,
  statements: [],
  disableDrop: false,
  addStatement: null,
};

export default Column;
