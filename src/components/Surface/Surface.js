import { useOrderPriority } from 'context/OrderPriorityContext';
import { StatementDataObject } from '../utils';
import React, { Fragment, useCallback, useReducer, useEffect } from "react";
import { useOrderPriority } from "context/OrderPriorityContext";
import Column from "./components/Column/Column";
import StatementList from "./components/StatementList/StatementList";
import AddStatement from "./components/StatementList/components/components/AddStatement";
import Summary from "./components/Summary/Summary";
import Messages from "./Messages";
import {
  DndContext,
  DragOverlay,
  useSensor,
  PointerSensor,
  KeyboardSensor
} from "@dnd-kit/core";
import Comment from "./components/StatementList/components/components/Comment";
import Prioritized from "./components/StatementList/components/Prioritized";
import classnames from "classnames";
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';


function Surface() {
  const context = useOrderPriority();


  function isDroppingOnAlreadyPrioritizedStatement(draggedElement) {
    return draggedElement.isPlaceholder === false;
  }

  function draggingOverFromRemainingToPrioritized(active, over) {
    if (active === undefined || over === undefined) {
      return false;
    }
    const [activeString] = active.id.toString().split('-') ?? [];
    const [overString] = over.id.toString().split('-') ?? [];

    return activeString === 'remaining' && overString === 'prioritized';
  }

  function isDraggedElementFromRemaining(dragged) {
    if (dragged === undefined) {
      return false;
    }

    return dragged.isPlaceholder === true;
  }

  function isArrangingPrioritizedStatements(active, over) {
    const [activeString] = active.id.toString().split('-') ?? [];
    const [overString] = over.id.toString().split('-') ?? [];

    return activeString === 'prioritized' && overString === 'prioritized';
  }

  function swapIndexPositionbetweenElements(activeId, overId, prioritizedStatements) {
    const droppedIndex = prioritizedStatements.indexOf(parseInt(overId));
    const tempIndex = prioritizedStatements.indexOf(parseInt(activeId));
    [prioritizedStatements[tempIndex], prioritizedStatements[droppedIndex]] = [prioritizedStatements[droppedIndex], prioritizedStatements[tempIndex]];
    prioritizedStatements[droppedIndex] = parseInt(activeId);
  }

  /**
   * Initialize the content type
   *
   * @return {{prioritizedStatements: null[], remainingStatements: null[], showOneColumn: boolean, statements: StatementDataObject[], canAddPrioritized: (boolean|boolean)}}
   */
  function init() {
    const {
      params: {
        statementsList = [],
      },
      behaviour: {
        prepopulate = false,
        randomizeStatements = false,
        allowAddingOfStatements = false,
        numberOfStatements = statementsList.length,
      }
    } = context;

    if (numberOfStatements > statementsList.length) {
      new Array(numberOfStatements - statementsList.length)
        .fill(null)
        .forEach((element) => statementsList.push(element));
    }

    if (randomizeStatements === true) {
      statementsList.sort(() => 0.5 - Math.random());
    }

    const statements = statementsList.map((statement, index) => {
      const statementObject = new StatementDataObject({
        id: index,
        displayIndex: index + 1,
        comment: '',
      });

      if (statement !== null) {
        statementObject.statement = statement;
        statementObject.isPlaceholder = !prepopulate;
        statementObject.touched = prepopulate && statementObject.displayIndex <= numberOfStatements;
      }
      else {
        statementObject.isPlaceholder = true;
        statementObject.added = true;
      }
      return statementObject;
    });

    const remainingStatements = prepopulate === true ? statements.slice(numberOfStatements) : statements.filter((statement) => statement.added === false);
    const prioritizedStatements = statements.filter((statement) => statement.displayIndex <= numberOfStatements || statement.touched);

    return {
      statements: statements,
      remainingStatements: remainingStatements.map((statement) => statement.id),
      prioritizedStatements: prioritizedStatements.map((statement) => statement.id),
      showOneColumn: prepopulate,
      canAddPrioritized: allowAddingOfStatements && remainingStatements.length === 0,
    };
  }

  /**
   * Create new StatementDataObject when adding custom statements
   * @return {StatementDataObject}
   */
  function createNewStatement() {
    return new StatementDataObject({
      added: true,
      isUserAdded: true,
      editMode: true,
      statement: '',
    });
  }

  /**
   * Handling of all update in the state for the content type
   * @param state
   * @param action
   * @return {{statements: (*|string)[]}|{prioritizedStatements, remainingStatements: null[], showOneColumn, statements: StatementDataObject[], canAddPrioritized: boolean}|{prioritizedStatements: unknown[], statements: any, canAddPrioritized: (boolean|*)}|{prioritizedStatements: unknown[], remainingStatements: unknown[], showOneColumn: boolean, statements: any, canAddPrioritized: (*|boolean)}|*|{statements: any}|{isCombineEnabled: boolean}|{remainingStatements: unknown[], statements: any}}
   */

  function stateHeadQuarter(state, action) {
    switch (action.type) {
      case "dragUpdate": {
        const { active, over } = action.payload;

        const statementClone = JSON.parse(JSON.stringify(state.statements));
        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const dragged = active.data.current.statement;
        const dropped = over.data.current.statement;
        const previousDraggedIndex = parseInt(dragged.displayIndex);

        if (!dropped) {
          return state;
        }

        if (previousDraggedIndex > -1) {
          statementClone.find((statement) => statement.id == dragged.id).displayIndex = dropped.displayIndex;
          statementClone.find((statement) => statement.id == dropped.id).displayIndex = previousDraggedIndex;
          if (dragged.displayIndex !== dropped.displayIndex) {
            const droppedIndex = dropped.displayIndex - 1;
            const draggedIndex = dragged.displayIndex - 1;
            const tempIndex = prioritizedStatements[droppedIndex]; // 1
            prioritizedStatements[droppedIndex] =
              prioritizedStatements[draggedIndex]; // 0
            prioritizedStatements[draggedIndex] = tempIndex; // 1
          }
        }

        return {
          ...state,
          prioritizedStatements: prioritizedStatements,
          statements: statementClone,
        };
      }
      case "dragEnd": {
        let { active, over } = action.payload;

        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const remainingStatements = Array.from(state.remainingStatements);
        const newStatements = JSON.parse(JSON.stringify(state.statements));
        const [, activeId] = active.id.toString().split("-") ?? [];
        const [, overId] = over.id.toString().split("-") ?? [];
        const draggedElement = newStatements[activeId];
        const droppedElement = newStatements[parseInt(overId)];

        if (isArrangingPrioritizedStatements(active, over)) {
          const droppedIndex = prioritizedStatements.indexOf(parseInt(overId));
          const draggedIndex = prioritizedStatements.indexOf(
            parseInt(activeId)
          );
          if (droppedIndex === draggedIndex) {
            prioritizedStatements.splice(draggedIndex, 1);
            prioritizedStatements.splice(droppedIndex, 0, parseInt(activeId));
          }
        }
        if (draggingOverFromRemainingToPrioritized(active, over)) {
          const draggedIndex = remainingStatements.indexOf(parseInt(activeId));
          if (
            isDraggedElementFromRemaining(draggedElement) &&
            isDroppingOnAlreadyPrioritizedStatement(droppedElement)
          ) {
            draggedElement.isPlaceholder = false;
            draggedElement.touched = true;
            droppedElement.isPlaceholder = true;
            droppedElement.touched = false;
            remainingStatements[draggedIndex] = droppedElement.id;
            swapIndexPositionbetweenElements(
              activeId,
              overId,
              prioritizedStatements
            );
          }
          else if (isDraggedElementFromRemaining(draggedElement)) {
            remainingStatements.splice(draggedIndex, 1);
            swapIndexPositionbetweenElements(
              activeId,
              overId,
              prioritizedStatements
            );
            draggedElement.isPlaceholder = false;
            draggedElement.touched = true;
          }
        }

        prioritizedStatements.forEach((statementId, index) => {
          newStatements[statementId].displayIndex = index + 1;
        });

        return {
          ...state,
          statements: newStatements,
          prioritizedStatements: prioritizedStatements,
          remainingStatements: remainingStatements,
          showOneColumn: remainingStatements.length === 0,
          canAddPrioritized:
            remainingStatements.length === 0 &&
            context.behaviour.allowAddingOfStatements &&
            prioritizedStatements.filter(
              (statement) => !newStatements[statement.id]?.touched
            ).length > 0,
        };
      }

      case "statementChange": {
        const { statement } = action.payload;
        const statements = Array.from(state.statements);
        statements[statement.id] = statement;
        return {
          ...state,
          statements,
        };
      }

      case "addNewRemainingStatement": {
        const newStatement = createNewStatement();
        newStatement.id = state.statements.length;
        newStatement.isPlaceholder = true;
        const remainingStatements = Array.from(state.remainingStatements);
        remainingStatements.push(newStatement.id);
        const statements = JSON.parse(JSON.stringify(state.statements));
        statements.push(newStatement);

        return {
          ...state,
          statements,
          remainingStatements,
        };
      }
      case "addNewPrioritizedStatement": {
        const statements = JSON.parse(JSON.stringify(state.statements));
        const newStatement = createNewStatement();
        newStatement.id = statements.length;
        newStatement.touched = true;
        newStatement.isPlaceholder = false;
        newStatement.displayIndex = Messages.position(newStatement.id);
        statements.push(newStatement);

        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const untouched = prioritizedStatements.filter(
          (elementId) => statements[elementId].touched === false
        );

        if (untouched.length > 0) {
          const statementId = untouched.shift();
          statements[statementId].editMode = true;
          statements[statementId].touched = true;
          statements[statementId].isPlaceholder = false;
        }
        else {
          prioritizedStatements.push(newStatement.id);
        }

        return {
          ...state,
          statements,
          prioritizedStatements,
          canAddPrioritized:
            state.remainingStatements.length === 0 &&
            context.behaviour.allowAddingOfStatements,
        };
      }
      case "reset": {
        return init();
      }
      default:
        return state;
    }
  }

  function isDroppingOnAlreadyPrioritizedStatement(draggedElement) {
    return draggedElement.isPlaceholder === false;
  }

  function draggingOverFromRemainingToPrioritized(active, over) {
    if (active === undefined || over === undefined) {
      return false;
    }
    const [activeString] = active.id.toString().split("-") ?? [];
    const [overString] = over.id.toString().split("-") ?? [];

    return activeString === "remaining" && overString === "prioritized";
  }

  function isDraggedElementFromRemaining(dragged) {
    if (dragged === undefined) {
      return false;
    }

    return dragged.isPlaceholder === true;
  }

  function isArrangingPrioritizedStatements(active, over) {
    const [activeString] = active.id.toString().split("-") ?? [];
    const [overString] = over.id.toString().split("-") ?? [];

    return activeString === "prioritized" && overString === "prioritized";
  }

  function swapIndexPositionbetweenElements(
    activeId,
    overId,
    prioritizedStatements
  ) {
    const droppedIndex = prioritizedStatements.indexOf(parseInt(overId));
    const tempIndex = prioritizedStatements.indexOf(parseInt(activeId));
    [prioritizedStatements[tempIndex], prioritizedStatements[droppedIndex]] = [
      prioritizedStatements[droppedIndex],
      prioritizedStatements[tempIndex],
    ];
    prioritizedStatements[droppedIndex] = parseInt(activeId);
  }

  const memoizedReducer = useCallback(stateHeadQuarter, []);
  const [state, dispatch] = useReducer(memoizedReducer, init());

  useEffect(() => {
    context.trigger("resize");

    // We don't want to trigger resize when `context` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.remainingStatements]);

  /**
   * Callback that is called when exporting the values
   * @return {{prioritizedStatements, statements: *[]}}
   */
  function sendExportValues() {
    const { statements, prioritizedStatements } = state;
    return {
      statements,
      prioritizedStatements,
    };
  }

  const {
    collectExportValues,
    registerReset,
    behaviour: { provideSummary = true },
    translate,
  } = context;

  registerReset(() => dispatch({ type: 'reset' }));
  collectExportValues('userInput', sendExportValues);

  /**
  registerReset(() => dispatch({ type: "reset" }));
  collectExportValues("userInput", sendExportValues);

  /**
   * Initialize the content type
   *
   * @return {{prioritizedStatements: null[], remainingStatements: null[], showOneColumn: boolean, statements: StatementDataObject[], canAddPrioritized: (boolean|boolean)}}
   */
  function init() {
    const {
      params: { statementsList = [] },
      behaviour: {
        prepopulate = false,
        randomizeStatements = false,
        allowAddingOfStatements = false,
        numberOfStatements = statementsList.length,
      },
    } = context;

    if (numberOfStatements > statementsList.length) {
      new Array(numberOfStatements - statementsList.length)
        .fill(null)
        .forEach((element) => statementsList.push(element));
    }

    if (randomizeStatements === true) {
      statementsList.sort(() => 0.5 - Math.random());
    }

    const statements = statementsList.map((statement, index) => {
      const statementObject = new StatementDataObject({
        id: index,
        displayIndex: index + 1,
        comment: "",
      });

      if (statement !== null) {
        statementObject.statement = statement;
        statementObject.isPlaceholder = !prepopulate;
        statementObject.touched =
          prepopulate && statementObject.displayIndex <= numberOfStatements;
      }
      else {
        statementObject.isPlaceholder = true;
        statementObject.added = true;
      }
      return statementObject;
    });

    const remainingStatements =
      prepopulate === true
        ? statements.slice(numberOfStatements)
        : statements.filter((statement) => statement.added === false);
    const prioritizedStatements = statements.filter(
      (statement) =>
        statement.displayIndex <= numberOfStatements || statement.touched
    );

    return {
      statements: statements,
      remainingStatements: remainingStatements.map((statement) => statement.id),
      prioritizedStatements: prioritizedStatements.map(
        (statement) => statement.id
      ),
      showOneColumn: prepopulate,
      canAddPrioritized:
        allowAddingOfStatements && remainingStatements.length === 0,
    };
  }

  /**
   * Get details for lists that is provided for the screen readers
   * @param droppableId
   * @param droppable
   * @return {any}
   */
  function getListDetails(droppable, startPosition, destinationPosition) {
    const droppableId = droppable.id;
    const [droppableType] = droppableId.split("-");

    let details = {};

    switch (droppableType) {
      case "prioritized":
        details = {
          listSize: state.prioritizedStatements.length,
          listName: context.translations.destinationName,
        };
        break;
      case "remaining":
        details = {
          listSize: state.remainingStatements.length,
          listName: context.translations.sourceName,
        };
        break;
    }

    return Object.assign(
      {
        listId: droppableId,
        startPosition,
        destinationPosition,
      },
      droppable,
      details
    );
  }

  const [active, setActive] = React.useState(null);
  const handleDragStart = ({ active }) => {
    setActive(active);
  };

  /**
   * Update state and screen reader during the drag
   *
   * @type {(...args: any[]) => any}
   */
  function onDragUpdate(dragResult) {
    let { active, over } = dragResult;

    if (active?.id == null || over?.id == null) {
      return;
    }

    const droppedListId = over.id.toString().split("-")[0] ?? [];
    const draggedListId = active.id.toString().split("-")[0] ?? [];
    if (
      !over ||
      (over && droppedListId === "remaining") ||
      draggedListId === "remaining"
    ) {
      return;
    }

    dispatch({
      type: "dragUpdate",
      payload: {
        ...dragResult,
      },
    });
  }

  /**
   * Update the state and screen reader after drag ends
   * @type {(...args: any[]) => any}
   */
  function handleDragEnd(dragResult) {
    let { active, over } = dragResult;

    if (active?.id == null || over?.id == null) {
      return;
    }

    dispatch({
      type: "dragEnd",
      payload: {
        ...dragResult,
      },
    });
  }

  /**
   * Callback that stores changes when the user changes the statements
   * @param statement
   */
  function handleOnStatementChange(statement) {
    dispatch({
      type: "statementChange",
      payload: { statement },
    });
  }

  /**
   * Create new StatementDataObject when adding custom statements
   * @return {StatementDataObject}
   */
  function createNewStatement() {
    return new StatementDataObject({
      added: true,
      isUserAdded: true,
      editMode: true,
      statement: "",
    });
  }

  function createPrioritizedStatementWithComment(statement) {
    const actions = (
      <Comment
        onCommentChange={()=>{}}
        comment={statement.comment}
        onClick={null}
        ref={null}
        showCommentInPopup={true}
      />
    );
    return (
      <div
        className={classnames("h5p-order-priority-draggable-element", {
          'h5p-order-priority-no-transform': true,
        })}
      >
        <Prioritized
          statement={statement}
          actions={actions}
          displayIndex={statement.displayIndex}
          onStatementChange={null}
          enableEditing={false}
          enableCommentDisplay={true}
          onCommentBlur={null}
          onCommentChange={null}
          inputRef={null}
          isDragging={true}
          attributes={null}
          listeners={null}
        />
      </div>
    );
  }

  const statementLists = {};

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  /**
   * Sorting the statements and put them in appropriate columns
   * @return {*}
   */
  function handleSurface() {
    return (
      <Fragment>
        <DndContext
          className="h5p-order-prioritySurface"
          onDragEnd={handleDragEnd}
          onDragOver={onDragUpdate}
          onDragStart={handleDragStart}
          sensors={[pointerSensor, keyboardSensor]}
          accessibility={{
            announcements: {
              onDragStart({ active }) {
                return `Picked up draggable item ${active.id}.`;
              },
              onDragOver: ({ active, over }) => {
                if (!active || !over) {
                  return;
                }

                const activeId = active.data.current.statement?.id;

                const startPosition = state.statements.find(
                  (statement) => statement.id === activeId
                )?.displayIndex;
                const destinationPosition =
                  over?.data?.current?.statement?.displayIndex;

                const sourceDetails = getListDetails(
                  active,
                  startPosition,
                  destinationPosition
                );
                const destinationDetails = getListDetails(
                  over,
                  startPosition,
                  destinationPosition
                );

                let announcement = '';

                const movedInSameList =
                  sourceDetails.listId === destinationDetails.listId;
                if (movedInSameList) {
                  announcement = translate(
                    "dragMoveInSameList",
                    Messages.startEndLength(sourceDetails, destinationDetails)
                  );
                }
                else {
                  announcement = translate(
                    "dragMoveInDifferentList",
                    Messages.namesPositionsLengths(
                      sourceDetails,
                      destinationDetails
                    )
                  );
                }

                return announcement;
              },
              onDragEnd({ active, over }) {
                if (over) {
                  return `Draggable item ${active.id} was dropped over droppable area ${over.id}`;
                }

                return `Draggable item ${active.id} was dropped.`;
              },
              onDragCancel({ active }) {
                return `Dragging was cancelled. Draggable item ${active.id} was dropped.`;
              },
            },
          }}
        >
          <Column
            droppableId={'processed'}
            combine={state.isCombineEnabled}
            additionalClassName={'h5p-order-priority-dropzone'}
            prioritizedStatements={state.prioritizedStatements}
            addStatement={
              state.canAddPrioritized === true ? (
                <AddStatement
                  onClick={() =>
                    dispatch({
                      type: "addNewPrioritizedStatement",
                    })
                  }
                  translations={context.translations}
                />
              ) : null
            }
          >
            {state.prioritizedStatements
              .map((statementId) => state.statements[statementId])
              .map((statement, index) => {
                const statementId = 'prioritized-' + statement.id;
                const statementElement = (
                  <StatementList
                    key={'prioritized-' + statement.id}
                    id={'prioritized-' + statement.id}
                    draggableType="prioritized"
                    statement={statement}
                    index={index}
                    isSingleColumn={true}
                    onStatementChange={handleOnStatementChange}
                    enableEditing={context.behaviour.allowAddingOfStatements}
                    enableCommentDisplay={
                      context.behaviour.displayCommentsBelowStatement
                    }
                    disableTransform={state.isCombineEnabled}
                    translate={context.translate}
                  />
                );
                statementLists[statementId] = statementElement;
                if (statement.comment && statement.comment.length > 0 ) {
                  statementLists[statementId] = createPrioritizedStatementWithComment(statement);
                }
                return statementElement;
              })}
          </Column>
          {state.remainingStatements.length > 0 && (
            <Column
              droppableId="remaining"
              disableDrop={true}
              additionalClassName={'h5p-order-priority-select-list'}
              prioritizedStatements={state.remainingStatements}
              addStatement={
                context.behaviour &&
                context.behaviour.allowAddingOfStatements === true ? (
                    <AddStatement
                      onClick={() =>
                        dispatch({
                          type: "addNewRemainingStatement",
                        })
                      }
                      translations={context.translations}
                    />
                  ) : null
              }
            >
              {state.remainingStatements
                .map((statementId) => state.statements[statementId])
                .map((statement, index) => {
                  const statementId = 'remaining-' + statement.id;
                  const statementElement = (
                    <StatementList
                      key={'remaining-' + statement.id}
                      id={'remaining-' + statement.id}
                      draggableType="remaining"
                      statement={statement}
                      index={index}
                      onStatementChange={handleOnStatementChange}
                      enableEditing={context.behaviour.allowAddingOfStatements}
                      translate={context.translate}
                    />
                  );
                  statementLists[statementId] = statementElement;

                  return statementElement;
                })}
            </Column>
          )}
          <DragOverlay>{active ? statementLists[active.id] : null}</DragOverlay>
        </DndContext>
      </Fragment>
    );
  }

  return (
    <div>
      <div
        className="h5p-order-prioritySurface"
        onTouchStart={() => {}} //silly call to make it work in Apple products
      >
        <p className={"visible-hidden"}>
          {context.translations.userInfoAboutFocusMode}
        </p>
        {handleSurface()}
      </div>
      {provideSummary === true && <Summary />}
    </div>
  );
}

export default Surface;
