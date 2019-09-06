import React from 'react';

const ActionsList = (
    {children}
) => {
    return (
        <ul className={"h5p-order-priority-actionlist"}>
            {children}
        </ul>
    );
};

export default ActionsList;