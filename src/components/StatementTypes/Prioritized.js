import React from 'react';
import PropTypes from 'prop-types';
import PriorityNumber from "./components/PriorityNumber";

const Prioritized = ({
                       statement,
                       actions,
                       displayIndex,
                   }) => {
    return (
        <div>
            <PriorityNumber
                displayIndex={displayIndex}
            />
            <div
                className="h5p-droparea"
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
            </div>
        </div>
    );

};

Prioritized.propTypes = {
    statement: PropTypes.string,
    actions: PropTypes.object,
    displayIndex: PropTypes.number,
};

export default Prioritized;
