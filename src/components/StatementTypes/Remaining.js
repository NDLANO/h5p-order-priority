import React from 'react';
import PropTypes from 'prop-types';
import EditableStatement from "./components/EditableStatement";
import UnEditableStatement from "./components/UnEditableStatement";

const Remaining = props => {
    const {
        statement,
        onStatementChange,
        enableEditing = false,
    } = props;

    return (
        <div
            className="h5p-order-priority-statement"
        >
            <div>
                <div className={"h5p-order-priority-drag-element"}>
                    <i className="fa fa-arrows" />
                </div>
                {enableEditing === true && (
                    <EditableStatement
                        statement={statement.statement}
                        inEditMode={statement.editMode}
                        onBlur={onStatementChange}
                    />
                )}
                {enableEditing !== true && (
                    <UnEditableStatement
                        statement={statement.statement}
                    />
                )}
            </div>
        </div>
    );

};

Remaining.propTypes = {
    statement: PropTypes.object,
    onStatementChange: PropTypes.func,
    enableEditing: PropTypes.bool,
};

export default Remaining;
