import React from 'react';
import PriorityNumber from "./components/PriorityNumber";

const Placeholder = ({
                         useIndex,
                         displayIndex
                     }) => {

    return (
        <div>
            {useIndex === true && (
                <PriorityNumber
                    displayIndex={displayIndex}
                />
            )}
            <div
                className="h5p-droparea"
            />
        </div>
    );
};

export default Placeholder;
