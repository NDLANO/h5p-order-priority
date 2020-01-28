import React from 'react';
import PropTypes from 'prop-types';
import DragArrows from "./components/DragArrows";
import EditableStatement from "./components/EditableStatement";
import UnEditableStatement from "./components/UnEditableStatement";
import classnames from 'classnames';

function Remaining(props) {
  const {
    statement,
    onStatementChange,
    enableEditing = false,
    isDragging = false,
  } = props;

  let displayStatement;
  if ( enableEditing ) {
    displayStatement = (
      <EditableStatement
        statement={statement.statement}
        inEditMode={statement.editMode}
        onBlur={onStatementChange}
        idBase={statement.id}
      />
    );
  }
  else {
    displayStatement = (
      <UnEditableStatement
        statement={statement.statement}
      />
    );
  }

  return (
    <div
      className={classnames("h5p-order-priority-statement", {
        "h5p-order-priority-active-draggable": isDragging
      })}
    >
      <div className={"h5p-order-priority-statement-remaining"}>
        <DragArrows />
        {displayStatement}
      </div>
    </div>
  );

}

Remaining.propTypes = {
  statement: PropTypes.object,
  onStatementChange: PropTypes.func,
  enableEditing: PropTypes.bool,
};

export default Remaining;
