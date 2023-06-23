import React from 'react';
import PropTypes from 'prop-types';
import DragArrows from './components/DragArrows';
import EditableStatement from './components/EditableStatement';
import UnEditableStatement from './components/UnEditableStatement';
import classnames from 'classnames';

/**
 * Statements that are provided but not interacted with
 * @param props
 * @return {*}
 * @constructor
 */
function Remaining(props) {
  const {
    statement,
    onStatementChange,
    enableEditing = false,
    isDragging
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
    >
      <div className={'h5p-order-priority-statement-remaining'}>
        <DragArrows draggableProps={props.draggableProps} />
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
