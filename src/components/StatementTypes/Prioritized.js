import React from 'react';
import PropTypes from 'prop-types';
import Placeholder from "./Placeholder";
import EditableStatement from "./components/EditableStatement";
import UnEditableStatement from "./components/UnEditableStatement";

const Prioritized = ({
                         statement,
                         actions,
                         displayIndex,
                         onStatementChange,
                         enableEditing,
                     }) => {
    return (
        <Placeholder
            displayIndex={displayIndex}
        >
            <div
                className="h5p-order-priority-statement"
            >
                <div>
                    <div className={"h5p-order-priority-drag-element"}>
                        <i className="fa fa-arrows"/>
                    </div>
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
        </Placeholder>
    );

};

Prioritized.propTypes = {
    statement: PropTypes.object,
    actions: PropTypes.object,
    displayIndex: PropTypes.number,
    onStatementChange: PropTypes.func,
    enableEditing: PropTypes.bool,
};

export default Prioritized;
