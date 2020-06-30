import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Draggable} from "react-beautiful-dnd";
import Remaining from "./components/Remaining";
import Prioritized from "./components/Prioritized";
import Placeholder from "./components/Placeholder";
import Comment from "./components/components/Comment";
import classnames from "classnames";
import 'styles/components/StatementList.scss';

function StatementList(props) {

  const inputRef = useRef();
  const [showCommentContainer, toggleCommentContainer] = useState(false);

  function handleStatementType(isDragging, dragHandleProps) {
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
          draggableProps={dragHandleProps}
        />
      );
    }
    else if (draggableType === 'prioritized' && !statement.isPlaceholder) {
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
          draggableProps={dragHandleProps}
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
            className={"h5p-order-priority-empty"}
          />
        </Placeholder>
      );
    }
  }

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
    statement.editMode = false;
    props.onStatementChange(statement);
  }

  const {
    index,
    statement,
    draggableType,
  } = props;

  return (
    <Draggable
      draggableId={draggableType + "-" + statement.id}
      index={index}
      isDragDisabled={draggableType === 'prioritized' && statement.isPlaceholder}
    >
      {(provided, snapshot) => {
        return (
          <li
            className={"h5p-order-priority-draggable-container"}
          >
            <div
              className={classnames("h5p-order-priority-draggable-element", {
                'h5p-order-priority-no-transform': props.disableTransform,
              })}
              aria-roledescription={props.translate('draggableItem')}
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              {handleStatementType(snapshot.isDragging, provided.dragHandleProps)}
            </div>
          </li>
        );
      }}
    </Draggable>
  );

}

StatementList.propTypes = {
  statement: PropTypes.object,
  index: PropTypes.number.isRequired,
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
