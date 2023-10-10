import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import DragArrows from './components/DragArrows.js';
import EditableStatement from './components/EditableStatement.js';
import UnEditableStatement from './components/UnEditableStatement.js';

/**
 * Statements that are provided but not interacted with
 * @param props
 * @return {*}
 * @constructor
 */
const Remaining = (props) => {
  const {
    statement,
    onStatementChange,
    enableEditing = false,
    isDragging,
    attributes,
    listeners
  } = props;

  let displayStatement;
  if ( enableEditing ) {
    displayStatement = (
      <EditableStatement
        statement={statement.statement}
        onChanged={onStatementChange}
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
      className={classnames('h5p-order-priority-statement', {
        'h5p-order-priority-active-draggable': isDragging
      })}
      {...attributes}
      {...listeners}
    >
      <div className={'h5p-order-priority-statement-remaining'}>
        <DragArrows draggableProps={props.draggableProps} />
        {displayStatement}
      </div>
    </div>
  );
};

Remaining.propTypes = {
  statement: PropTypes.object,
  onStatementChange: PropTypes.func,
  enableEditing: PropTypes.bool,
  attributes: PropTypes.object,
  listeners: PropTypes.object,
};

export default Remaining;
