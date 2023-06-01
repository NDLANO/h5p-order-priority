import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Remaining from './components/Remaining';
import Prioritized from './components/Prioritized';
import Placeholder from './components/Placeholder';
import Comment from './components/components/Comment';
import classnames from 'classnames';
import { CSS } from '@dnd-kit/utilities';
import 'styles/components/StatementList.scss';
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';

function StatementList(props) {

  const inputRef = useRef();
  const draggableRef = useRef();
  const [showCommentContainer, toggleCommentContainer] = useState(false);

  /**
   * Comments can be displayed in two ways.
   * @return {(function(...[*]=))|null}
   */
  function handleCommentClick() {
    if (props.enableCommentDisplay !== true) {
      return null;
    }

    return () => {
      toggleCommentContainer(true);
      setTimeout(() => inputRef.current.focus(), 0);
    };
  }

  function handleOnCommentBlur(comment) {
    if (!comment || comment.length === 0) {
      toggleCommentContainer(false);
    }
  }

  function handleOnCommentChange(comment) {
    const statement = Object.assign({}, props.statement);
    statement.comment = comment;
    props.onStatementChange(statement);
  }

  function handleOnStatementTextEdit(statementText) {
    const statement = Object.assign({}, props.statement);
    statement.statement = statementText;
    draggableRef.current.setAttribute('aria-label', statementText);
    statement.editMode = false;
    props.onStatementChange(statement);
  }

  /**
   * Determine what statement type to use for a statement. The different types are:
   *   - remainging: statements that has not been touched
   *   - prioritiezed: statements that has been put in an order
   *   - placeholder: containers that serve as dropzones in the ordered list
   * @param isDragging
   * @param attributes
   * @param listeners
   * @return {*}
   */
  function handleStatementType(isDragging, attributes, listeners) {
    const {
      statement,
      draggableType,
      isSingleColumn,
      enableEditing,
      translate,
    } = props;

    if (draggableType === 'remaining') {
      return (
        <Remaining
          statement={statement}
          onStatementChange={handleOnStatementTextEdit}
          enableEditing={enableEditing}
          isDragging={isDragging}
          attributes={attributes}
          listeners={listeners}
        />
      );
    }
    else if (draggableType === 'prioritized' && statement.isPlaceholder == false) {
      let actions;
      if (isSingleColumn) {
        actions = (
          <Comment
            onCommentChange={handleOnCommentChange}
            comment={statement.comment}
            onClick={handleCommentClick()}
            ref={inputRef}
            showCommentInPopup={!props.enableCommentDisplay}
          />
        );
      }
      return (
        <Prioritized
          statement={statement}
          actions={actions}
          displayIndex={statement.displayIndex}
          onStatementChange={handleOnStatementTextEdit}
          enableEditing={enableEditing}
          enableCommentDisplay={showCommentContainer}
          onCommentBlur={handleOnCommentBlur}
          onCommentChange={handleOnCommentChange}
          inputRef={inputRef}
          isDragging={isDragging}
          attributes={attributes}
          listeners={listeners}
        />
      );
    }
    else if (draggableType === 'prioritized') {
      return (
        <Placeholder
          displayIndex={statement.displayIndex}
          translate={translate}
        >
          <div
            className={'h5p-order-priority-empty'}
          />
        </Placeholder>
      );
    }
  }

  const {
    statement,
    id,
  } = props;

  const animateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true });

  const { setNodeRef, transform, transition, attributes, listeners, isDragging } =
  useSortable({
    id: id,
    data: { statement },
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    cursor: 'grab'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classnames('h5p-dnd-draggable', {
        'h5p-dnd-draggable--dragging': isDragging
      })}
      {...attributes}
      {...listeners}
    >
      <li
        className={'h5p-order-priority-draggable-container'}
      >
        <div
          ref={draggableRef}
          className={classnames('h5p-order-priority-draggable-element', {
            'h5p-order-priority-no-transform': props.disableTransform,
          })}
          aria-roledescription={props.translate('draggableItem')}
          aria-label={props.statement.statement}
        >
          {handleStatementType(isDragging, attributes, listeners)}
        </div>
      </li>
    </div>
  );

}

StatementList.propTypes = {
  statement: PropTypes.object,
  index: PropTypes.number.isRequired,
  id: PropTypes.string,
  draggableType: PropTypes.string.isRequired,
  isSingleColumn: PropTypes.bool,
  onStatementChange: PropTypes.func,
  enableEditing: PropTypes.bool,
  enableCommentDisplay: PropTypes.bool,
  disableTransform: PropTypes.bool,
  translate: PropTypes.func,
};

StatementList.defaultProps = {
  isSingleColumn: false,
  statement: {},
  enableEditing: false,
  enableCommentDisplay: false,
  disableTransform: false,
};

export default StatementList;
