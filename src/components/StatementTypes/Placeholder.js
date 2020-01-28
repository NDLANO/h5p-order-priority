import React, {useContext} from 'react';
import PriorityNumber from "./components/PriorityNumber";
import classnames from 'classnames';
import {OrderPriorityContext} from "context/OrderPriorityContext";

const Placeholder = ({
  displayIndex,
  children,
  isDraggingOver = false,
}) => {
  const context = useContext(OrderPriorityContext);

  const {
    translate
  } = context;

  return (
    <div>
      <PriorityNumber
        displayIndex={displayIndex}
      />
      <div
        className={classnames("h5p-droparea", {
          "h5p-order-priority-active-droppable": isDraggingOver
        })}
        aria-label={(children ? translate("droparea", {':index': displayIndex}) : translate("emptydroparea", {":index": displayIndex}))}
      >
        {children}
      </div>
    </div>
  );
};

export default Placeholder;
