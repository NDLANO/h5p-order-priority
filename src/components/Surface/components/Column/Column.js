// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Droppable from "../StatementList/components/components/Droppable";
import { SortableContext } from "@dnd-kit/sortable";

/**
 * Add columns that acts as dropzones for the statements
 * @param props
 * @return {*}
 * @constructor
 */
function Column(props) {
  const {
    droppableId,
    combine,
    children,
    disableDrop,
    additionalClassName,
    addStatement,
    statements
  } = props;

  return (
    <div className={additionalClassName}>
      <SortableContext 
        // items={connectedArguments.map((argumentId) => `argument-${argumentId}`)}
        // items={[statements.map((id) => ``)]}
      >
        <Droppable id={droppableId} disabled={true}>
          {/* <ul className={classnames("h5p-order-priority-column")}> */}
            {children}
            {/* <li style={{ display: !combine ? "block" : "none" }}>
            </li> */}
          {/* </ul> */}
        </Droppable>
      </SortableContext>
      {addStatement}
    </div>
  );
}

Column.propTypes = {
  statements: PropTypes.array,
  droppableId: PropTypes.string.isRequired,
  combine: PropTypes.bool,
  disableDrop: PropTypes.bool,
  additionalClassName: PropTypes.string,
  addStatement: PropTypes.object,
};

Column.defaultProps = {
  droppableId: null,
  combine: false,
  statements: [],
  disableDrop: false,
  addStatement: null,
};

export default Column;
