import React, {useContext} from 'react';
import {OrderPriorityContext} from "context/OrderPriorityContext";

function DragArrows() {
    const context = useContext(OrderPriorityContext);

    return (
        <div className={"h5p-order-priority-drag-element"}>
            <span
                className="fa fa-arrows"
                aria-hidden={"true"}
            />
            <span className={"visible-hidden"}>{context.translations.drag}</span>
        </div>
    );
}

export default DragArrows;