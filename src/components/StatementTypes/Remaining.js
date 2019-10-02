import React from 'react';
import PropTypes from 'prop-types';
import DragArrows from "./components/DragArrows";
import EditableStatement from "./components/EditableStatement";

function Remaining(props) {
    const {
        statement,
        onStatementChange,
        enableEditing = false,
    } = props;

    let displayStatement;
    if( enableEditing ){
        displayStatement = (
            <EditableStatement
                statement={statement.statement}
                inEditMode={statement.editMode}
                onBlur={onStatementChange}
                idBase={statement.id}
            />
        );
    } else {
        displayStatement = (
            <UnEditableStatement
                statement={statement.statement}
            />
        );
    }

    return (
        <div
            className="h5p-order-priority-statement"
        >
            <div>
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
