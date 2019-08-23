import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import PriorityNumber from "./components/PriorityNumber";

const Prioritized = ({
                       statement,
                       actions,
                       labels,
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
                    className="order-priority"
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
    labels: PropTypes.array,
    displayIndex: PropTypes.number,
};

Prioritized.defaultProps = {
    labels: [],
};

export default Prioritized;
