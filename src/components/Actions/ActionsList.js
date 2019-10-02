import React from 'react';

const ActionsList = (
    {children}
) => {
    return (
        <div
            className={"h5p-order-priority-actionlist"}
        >
            {children}
        </div>
    );
};

export default ActionsList;