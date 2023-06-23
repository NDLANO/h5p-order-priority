import React from 'react';
import PropTypes from 'prop-types';
import Placeholder from './Placeholder';
import DragArrows from './components/DragArrows';
import classnames from 'classnames';
import StatementComment from './components/StatementComment';
import EditableStatement from './components/EditableStatement';
import UnEditableStatement from './components/UnEditableStatement';

/**
 * Statement that is put in a prioritized list
 *
 * @param statement
 * @param actions
 * @param displayIndex
 * @param onStatementChange
 * @param enableEditing
 * @param enableCommentDisplay
 * @param onCommentChange
 * @param onCommentBlur
 * @param inputRef
 * @param draggableProps
 * @return {*}
 * @constructor
 */
function Prioritized({
  statement,
  actions,
  displayIndex,
  onStatementChange,
  enableEditing,
  enableCommentDisplay,
  onCommentChange,
  onCommentBlur,
  inputRef,
  draggableProps,
}) {
  return (
    <Placeholder
      displayIndex={displayIndex}
    >
      <div
        className={classnames('h5p-order-priority-statement', {
          'h5p-order-priority-statement-extra': enableCommentDisplay
        })}
      >
        <div className={'h5p-order-priority-statement-prioritized'}
        >
          <DragArrows draggableProps={draggableProps}/>
          {enableEditing === true && (
            <EditableStatement
              statement={statement.statement}
              onChanged={onStatementChange}
              idBase={statement.id}
            />
          )}
          {enableEditing !== true && (
            <UnEditableStatement
              statement={statement.statement}
            />
          )}
        </div>
        {actions}
      </div>
      {enableCommentDisplay && (
        <StatementComment
          comment={statement.comment}
          onCommentChange={onCommentChange}
          onCommentBlur={onCommentBlur}
          ref={inputRef}
          show={enableCommentDisplay}
        />
      )}
    </Placeholder>
  );
}

Prioritized.propTypes = {
  statement: PropTypes.object,
  actions: PropTypes.object,
  displayIndex: PropTypes.number,
  onStatementChange: PropTypes.func,
  enableEditing: PropTypes.bool,
  enableCommentDisplay: PropTypes.bool,
  onCommentChange: PropTypes.func,
  inputRef: PropTypes.object,
};


export default Prioritized;
