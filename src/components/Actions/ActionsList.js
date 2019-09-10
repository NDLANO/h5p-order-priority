import React from 'react';

const ActionsList = (
    {children}
) => {
    return (
        <div
            className={"h5p-order-priority-actionlist"}
            role={"listitem"}
        >
            {children}
        </div>
    );
};

export default ActionsList;