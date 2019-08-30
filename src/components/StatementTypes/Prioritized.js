import React from 'react';
import PropTypes from 'prop-types';
import Placeholder from "./Placeholder";

const Prioritized = ({
                       statement,
                       actions,
                       displayIndex,
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
                    {statement}
                </div>
                {actions}
            </div>
        </Placeholder>
    );

};

Prioritized.propTypes = {
    statement: PropTypes.string,
    actions: PropTypes.object,
    displayIndex: PropTypes.number,
};

export default Prioritized;
