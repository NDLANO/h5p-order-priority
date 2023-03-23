import React from "react";
import PropTypes from "prop-types";
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
    children,
    additionalClassName,
    addStatement,
    prioritizedStatements
  } = props;

  return (
    <div className={additionalClassName}>
      <SortableContext 
        items={prioritizedStatements.map((statementId) => `prioritized-${statementId}`)}
      >
        <Droppable id={droppableId} disabled={true}>
          {children}
        </Droppable>
      </SortableContext>
      {addStatement}
    </div>
  );
}

Column.propTypes = {
  prioritizedStatements: PropTypes.array,
  droppableId: PropTypes.string.isRequired,
  combine: PropTypes.bool,
  disableDrop: PropTypes.bool,
  additionalClassName: PropTypes.string,
  addStatement: PropTypes.object,
};

Column.defaultProps = {
  droppableId: null,
  combine: false,
  prioritizedStatements: [],
  disableDrop: false,
  addStatement: null,
};

export default Column;
