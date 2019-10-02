import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Draggable} from "react-beautiful-dnd";
import Remaining from "../StatementTypes/Remaining";
import Prioritized from "../StatementTypes/Prioritized";
import Placeholder from "../StatementTypes/Placeholder";
import ActionsList from "../Actions/ActionsList";
import Comment from "../Actions/Comment";
import classnames from "classnames";

function StatementList(props) {

    const inputRef = useRef();
    const [showCommentContainer, toggleCommentContainer] = useState(false);

    function handleStatementType() {
        const {
            statement,
            draggableType,
            isSingleColumn,
            enableEditing,
        } = props;

        if (draggableType === 'remaining') {
            return (
                <Remaining
                    statement={statement}
                    onStatementChange={handleOnStatementTextEdit}
                    enableEditing={enableEditing}
                />
            );
        } else if (draggableType === 'prioritized' && !statement.isPlaceholder) {
            let actions;
            if (isSingleColumn) {
                actions = (
                    <ActionsList>
                        <Comment
                            onCommentChange={handleOnCommentChange}
                            comment={statement.comment}
                            onClick={handleCommentClick()}
                            inputRef={inputRef}
                        />
                    </ActionsList>
                )
            }
            return (
                <Prioritized
                    statement={statement}
                    actions={actions}
                    displayIndex={statement.displayIndex}
                    onStatementChange={handleOnStatementTextEdit}
                    enableEditing={enableEditing}
                    enableCommentDisplay={showCommentContainer}
                    onCommentChange={handleOnCommentChange}
                    inputRef={inputRef}
                />
            )
        } else if (draggableType === 'prioritized') {
            return (
                <Placeholder
                    displayIndex={statement.displayIndex}
                />
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
        }
    }

    function handleOnCommentChange(comment) {
        const statement = Object.assign({}, props.statement);
        statement.comment = comment;
        props.onStatementChange(statement);
        if (!comment || comment.length === 0) {
            toggleCommentContainer(false);
        }
    }

    function handleOnStatementTextEdit(statementText) {
        const statement = Object.assign({}, props.statement);
        statement.statement = statementText;
        statement.editMode = false;
        props.onStatementChange(statement);
    }

    function getAriaLabel() {
        let ariaLabel = "Draggable item " + statement.statement;
        if (draggableType === 'prioritized') {
            ariaLabel = 'Dropzone ' + statement.displayIndex;
            if (statement.touched) {
                ariaLabel += ': value ' + statement.statement;
            }
        }

        return ariaLabel;
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
            {provided => {
                return (
                    <div
                        className={"h5p-order-priority-draggable-container"}
                        aria-label={getAriaLabel()}
                    >
                        <div
                            className={classnames("h5p-order-priority-draggable-element", {
                                'h5p-order-priority-no-transform': props.disableTransform
                            })}
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                        >
                            {handleStatementType()}
                        </div>
                    </div>
                )
            }}
        </Draggable>
    )

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
};

StatementList.defaultProps = {
    isSingleColumn: false,
    statement: {},
    enableEditing: false,
    enableCommentDisplay: false,
    disableTransform: false,
};

export default StatementList;
