import React from 'react';
import PriorityNumber from "./components/PriorityNumber";

const Placeholder = ({
                         displayIndex,
                         children
                     }) => {

    return (
        <div>
            <PriorityNumber
                displayIndex={displayIndex}
            />
            <div
                className="h5p-droparea"
            >
                {children}
            </div>
        </div>
    );
};

export default Placeholder;
