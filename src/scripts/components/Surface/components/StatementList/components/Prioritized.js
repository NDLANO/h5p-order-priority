import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Placeholder from './Placeholder.js';
import DragArrows from './components/DragArrows.js';
import StatementComment from './components/StatementComment.js';
import EditableStatement from './components/EditableStatement.js';
import UnEditableStatement from './components/UnEditableStatement.js';

/**
 * Statement that is put in a prioritized list
 * @param {object} params React props.
 * @param {object} params.statement Statement data.
 * @param {object} params.actions React children.
 * @param {number} params.displayIndex Index of statement.
 * @param {function} params.onStatementChange Callback when statement changed.
 * @param {boolean} params.enableEditing True, if user is editing statement.
 * @param {boolean} params.enableCommentDisplay True, if user can comment.
 * @param {function} params.onCommentChange Callback when comment was changed.
 * @param {function} params.onCommentBlur Callback when comment lost focus.
 * @param {function} params.translate Translate function.
 * @param {object} params.inputRef React input field reference.
 * @param {object} params.draggableProps Props for draggable.
 * @param {object} params.attributes DIV attributes.
 * @param {object} params.listeners DIV listeners.
 * @returns {object} JSX element.
 */
const Prioritized = ({
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
  attributes,
  listeners,
  translate
}) => {

  return (
    <Placeholder
      displayIndex={displayIndex}
    >
      <div
        className={classnames('h5p-order-priority-statement', {
          'h5p-order-priority-statement-extra': enableCommentDisplay
        })}
        {...attributes}
        {...listeners}
      >
        <div className={'h5p-order-priority-statement-prioritized'}
        >
          <DragArrows draggableProps={draggableProps}/>
          {enableEditing === true && (
            <EditableStatement
              statement={statement.statement}
              onChanged={onStatementChange}
              idBase={statement.id}
              translate={translate}
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
};

Prioritized.propTypes = {
  statement: PropTypes.object,
  actions: PropTypes.object,
  displayIndex: PropTypes.number,
  onStatementChange: PropTypes.func,
  enableEditing: PropTypes.bool,
  enableCommentDisplay: PropTypes.bool,
  onCommentChange: PropTypes.func,
  onCommentBlur: PropTypes.func,
  draggableProps: PropTypes.object,
  inputRef: PropTypes.object,
  attributes: PropTypes.object,
  listeners: PropTypes.object
};

export default Prioritized;
