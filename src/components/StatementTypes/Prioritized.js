import React from 'react';
import PropTypes from 'prop-types';
import Placeholder from "./Placeholder";
import EditableStatement from "./components/EditableStatement";
import UnEditableStatement from "./components/UnEditableStatement";
import DragArrows from "./components/DragArrows";
import classnames from 'classnames';
import StatementComment from "./components/StatementComment";

const Prioritized = ({
                         statement,
                         actions,
                         displayIndex,
                         onStatementChange,
                         enableEditing,
                         enableCommentDisplay,
                         onCommentChange,
                         inputRef,
                     }) => {
    return (
        <Placeholder
            displayIndex={displayIndex}
        >
            <div
                className={classnames("h5p-order-priority-statement", {
                    'h5p-order-priority-statement-extra': enableCommentDisplay && statement.comment && statement.comment.length > 0
                })}
            >
                <div>
                    <DragArrows/>
                    {enableEditing === true && (
                        <EditableStatement
                            inEditMode={statement.editMode}
                            statement={statement.statement}
                            onBlur={onStatementChange}
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
            <StatementComment
                comment={statement.comment}
                onCommentChange={onCommentChange}
                inputRef={inputRef}
                show={enableCommentDisplay}
            />
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
    inputRef: PropTypes.object,
};

export default Prioritized;
