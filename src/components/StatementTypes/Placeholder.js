import React from 'react';
import PriorityNumber from "./components/PriorityNumber";

const Placeholder = ({
                         displayIndex
                     }) => {

    return (
        <div>
            <PriorityNumber
                displayIndex={displayIndex}
            />
            <div
                className="h5p-droparea"
            />
        </div>
    );
};

export default Placeholder;
