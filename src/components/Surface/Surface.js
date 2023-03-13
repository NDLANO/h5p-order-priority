import React, {Fragment, useCallback, useReducer, useEffect} from 'react';
import {useOrderPriority} from "context/OrderPriorityContext";
import Column from './components/Column/Column';
import StatementList from "./components/StatementList/StatementList";
import AddStatement from "./components/StatementList/components/components/AddStatement";
import Summary from "./components/Summary/Summary";
import {StatementDataObject} from "../utils";
import Messages from "./Messages";
import { DndContext, DragOverlay } from '@dnd-kit/core';

function Surface() {
  const context = useOrderPriority();

  /**
   * Handling of all update in the state for the content type
   * @param state
   * @param action
   * @return {{statements: (*|string)[]}|{prioritizedStatements, remainingStatements: null[], showOneColumn, statements: StatementDataObject[], canAddPrioritized: boolean}|{prioritizedStatements: unknown[], statements: any, canAddPrioritized: (boolean|*)}|{prioritizedStatements: unknown[], remainingStatements: unknown[], showOneColumn: boolean, statements: any, canAddPrioritized: (*|boolean)}|*|{statements: any}|{isCombineEnabled: boolean}|{remainingStatements: unknown[], statements: any}}
 */ 
  
  function stateHeadQuarter(state, action) {
    switch (action.type) {
      case 'dragStart': {
  
        const {source} = action.payload;
        return {
          ...state,
          isCombineEnabled: source.droppableId !== 'processed'
        };
      }
      case 'dragUpdate': {
        const {
          active,
          over
        } = action.payload;
        
        
        const statementClone = JSON.parse(JSON.stringify(state.statements));
        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const activeId = parseInt(active.id.toString().split("-")[1] ?? []);
        const dragged = statementClone.find((statement) => statement.id === activeId);
        const destinationId = parseInt(over.id.toString().split('-')[1] ?? []);
        const testId = statementClone.find((statement) => statement.displayIndex === destinationId + 1).id;
        // const dragged = active.data.current.statement;
        const previousDraggedIndex = parseInt(dragged.displayIndex);
        const originalDisplayIndex = prioritizedStatements.indexOf(activeId) + 1;
        const destinationIndex = statementClone.find((statement) => statement.id === testId);

        if (previousDraggedIndex > -1) {

          console.log(prioritizedStatements);
          // console.log(`destinationIndex: ${JSON.stringify(destinationIndex)} `);
          // console.log(destinationId);
          // console.log(" ");
          dragged.displayIndex = destinationIndex.displayIndex;
          // statementClone[dragged]
          // console.log(`dragged displayIndex: ${dragged.displayIndex} `);
          // console.log(`Previous dragged displayIndex: ${previousDraggedIndex} `);
          const draggedIndexDifference = parseInt(dragged.displayIndex) - previousDraggedIndex;
          const originalSwapDisplayIndex = prioritizedStatements.indexOf(activeId) - draggedIndexDifference;
          if (draggedIndexDifference === 0) {
            dragged.displayIndex = originalDisplayIndex;
          }

          // console.log(`statementClone: ${JSON.stringify(statementClone)} `);
          prioritizedStatements
            .map(statementId => statementClone[statementId])
            .map((statementClone, index) => {
              if (statementClone.displayIndex === destinationIndex.displayIndex && index !== activeId) {
                  // statementClone.displayIndex -= draggedIndexDifference;
                  statementClone.displayIndex = previousDraggedIndex;
                // console.log(`activeId ${activeId}`);
                // console.log(`index: ${index} `);
                // console.log(`previousDisplayIndex: ${previousDraggedIndex}`);
                // console.log(`destinationIndex: ${JSON.stringify(destinationIndex)}`);
                // console.log(`statementClone: ${JSON.stringify(statementClone)}`);
                // if (draggedIndexDifference !== 0 ) {
                // }
                // else {
                //   console.log("else! jajajaja");
                //   console.log(originalSwapDisplayIndex);
                //   // statementClone.displayIndex = originalSwapDisplayIndex;
                // }
              }
            });

                console.log(statementClone);
                console.log(`---------------------------------------`);
        // console.log("previousDraggedIndex + 1");
        // console.log(typeof(previousDraggedIndex + 1));
        // console.log("draggedIndexDifference");
        // console.log(typeof(draggedIndexDifference));
        }

        

        // console.log(statementClone);
        return {
          ...state,
          // prioritizedStatements: prioritizedStatements,
          statements: statementClone
        };
      }
      case 'dragEnd': {
        let {
          // activatorEvent, // pointerdown {html target}
          active, // id: remaining-0, data {....}
          // collisions, // [{id: prioritized-0, data {...}}, {id: processed, data {...}}, {id: remaining-0, data {...}}, {id: start, data {...}}]
          // delta, // some coordination stuff
          over // {id: prioritized-0, data {...}}
        } = action.payload;

        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const remainingStatements = Array.from(state.remainingStatements);
        const newStatements = JSON.parse(JSON.stringify(state.statements));
        const [, activeId] = active.id.toString().split('-') ?? [];
        const [, overId] = over.id.toString().split('-') ?? [];
        const draggedElement = newStatements[activeId];
        const droppedElement = newStatements[parseInt(overId)];
        
        if (isArrangingPrioritizedStatements(active, over)) {
          const droppedIndex = prioritizedStatements.indexOf(parseInt(overId));
          const draggedIndex = prioritizedStatements.indexOf(parseInt(activeId));
          prioritizedStatements.splice(draggedIndex, 1);
          prioritizedStatements.splice(droppedIndex, 0, parseInt(activeId));
        }
        if (draggingOverFromRemainingToPrioritized(active, over)) {
          const draggedIndex = remainingStatements.indexOf(parseInt(activeId));
          if (isDraggedElementFromRemaining(draggedElement) && isDroppingOnAlreadyPrioritizedStatement(droppedElement)) {
            draggedElement.isPlaceholder = false;
            draggedElement.touched = true;
            droppedElement.isPlaceholder = true;
            droppedElement.touched = false;
            remainingStatements[draggedIndex] = droppedElement.id;
            swapIndexPositionbetweenElements(activeId, overId, prioritizedStatements);
          }
          else if (isDraggedElementFromRemaining(draggedElement)) {
            remainingStatements.splice(draggedIndex, 1);
            swapIndexPositionbetweenElements(activeId, overId, prioritizedStatements);
            draggedElement.isPlaceholder = false;
            draggedElement.touched = true;
          } 
        }

        prioritizedStatements.forEach((statementId, index) => {
          newStatements[statementId].displayIndex = index + 1;
        });

        console.log(newStatements);

        return {
          ...state,
          statements: newStatements, // Statements
          prioritizedStatements: prioritizedStatements, // [0,1]
          remainingStatements: remainingStatements, // [0,1]
          showOneColumn: remainingStatements.length === 0, // boolean
          canAddPrioritized: remainingStatements.length === 0 && context.behaviour.allowAddingOfStatements && prioritizedStatements.filter(statement => !newStatements[statement.id].touched).length > 0, // boolean
        };
      }

      case 'statementChange': {
        const {statement} = action.payload;
        const statements = Array.from(state.statements);
        statements[statement.id] = statement;
        return {
          ...state,
          statements
        };
      }

      case 'addNewRemainingStatement': {
        const newStatement = createNewStatement();
        newStatement.id = state.statements.length;
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
      case 'addNewPrioritizedStatement': {
        const statements = JSON.parse(JSON.stringify(state.statements));
        const newStatement = createNewStatement();
        newStatement.id = statements.length;
        newStatement.touched = true;
        newStatement.isPlaceholder = false;
        newStatement.displayIndex = Messages.position(newStatement.id);
        statements.push(newStatement);

        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const untouched = prioritizedStatements.filter(elementId => statements[elementId].touched === false);

        if ( untouched.length > 0) {
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
          canAddPrioritized: state.remainingStatements.length === 0 && context.behaviour.allowAddingOfStatements
        };
      }
      case 'reset': {
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
    const [activeString] = active.id.toString().split('-') ?? [];
    const [overString] = over.id.toString().split('-') ?? [];

    return activeString === "remaining" && overString === "prioritized";
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
    
    return activeString === "prioritized" && overString === "prioritized";
  }

  function swapIndexPositionbetweenElements(activeId, overId, prioritizedStatements) {
    const droppedIndex = prioritizedStatements.indexOf(parseInt(overId));
    const tempIndex = prioritizedStatements.indexOf(parseInt(activeId));
    [prioritizedStatements[tempIndex], prioritizedStatements[droppedIndex]] = [prioritizedStatements[droppedIndex], prioritizedStatements[tempIndex]];
    prioritizedStatements[droppedIndex] = parseInt(activeId);
  }

  const memoizedReducer = useCallback(stateHeadQuarter, []);
  const [state, dispatch] = useReducer(memoizedReducer, init());

  useEffect(() => {
    context.trigger('resize');
  }, [state.remainingStatements, state.prioritizedStatements]);

  /**
   * Callback that is called when exporting the values
   * @return {{prioritizedStatements, statements: *[]}}
   */
  function sendExportValues() {
    const {
      statements,
      prioritizedStatements,
    } = state;
    return {
      statements,
      prioritizedStatements,
    };
  }

  const {
    collectExportValues,
    registerReset,
    behaviour: {
      provideSummary = true,
    },
    translate,
  } = context;

  registerReset(() => dispatch({type: "reset"}));
  collectExportValues('userInput', sendExportValues);

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
        .forEach(element => statementsList.push(element));
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
        statementObject.touched = prepopulate && statementObject.displayIndex <= numberOfStatements;
      }
      else {
        statementObject.isPlaceholder = true;
        statementObject.added = true;
      }
      return statementObject;
    });

    const remainingStatements = prepopulate === true ? statements.slice(numberOfStatements) : statements.filter(statement => statement.added === false);
    const prioritizedStatements = statements.filter(statement => statement.displayIndex <= numberOfStatements || statement.touched);

    return {
      statements: statements,
      remainingStatements: remainingStatements.map(statement => statement.id),
      prioritizedStatements: prioritizedStatements.map(statement => statement.id),
      showOneColumn: prepopulate,
      canAddPrioritized: allowAddingOfStatements && remainingStatements.length === 0,
    };
  }

  /**
   * Get details for lists that is provided for the screen readers
   * @param droppableId
   * @param additionalInfo
   * @return {any}
   */
  function getListDetails(droppableId, additionalInfo) {
    let details = {};
    switch (droppableId) {
      case 'processed':
        details = {
          listSize: state.prioritizedStatements.length,
          listName: context.translations.destinationName,
        };
        break;
      case 'start':
        details = {
          listSize: state.remainingStatements.length,
          listName: context.translations.sourceName,
        };
        break;
    }

    return Object.assign({
      listId: droppableId
    }, additionalInfo, details);
  }

  const [active, setActive] = React.useState(null);
  const handleDragStart = ({active}) => {
    setActive(active);
  };

  /**
   * UUpdate state and screen reader during the drag
   *
   * @type {(...args: any[]) => any}
   */
  function onDragUpdate(dragResult) {
    let {active, over} = dragResult;

    if (active?.id == null || over?.id == null) {
      return;
    }

    const droppedListId = over.id.toString().split('-')[0] ?? [];
    const draggedListId = active.id.toString().split('-')[0] ?? [];
    if (!over || (over && droppedListId === "remaining" || draggedListId === "remaining")) {
      return;
    }

    dispatch({
      type: 'dragUpdate',
      payload: {
        ...dragResult
      }
    });
  } 

  // const onDragUpdate = useCallback((result, provider) => {

  //   if (result.destination && result.source) {
  //     const sourceDetails = getListDetails(result.source.droppableId, result.source);
  //     const destinationDetails = getListDetails(result.destination.droppableId, result.destination);
  //     if ( sourceDetails.listId === destinationDetails.listId) {
  //       provider.announce(translate("dragMoveInSameList", Messages.startEndLength(sourceDetails, destinationDetails)));
  //     }
  //     else {
  //       provider.announce(translate("dragMoveInDifferentList", Messages.namesPositionsLengths(sourceDetails, destinationDetails)));
  //     }
  //   }

  //   if (!result.destination || (result.source && result.source.droppableId === 'start')) {
  //     return;
  //   }

  //   dispatch({
  //     type: 'dragUpdate',
  //     payload: {
  //       result
  //     },
  //   });
  // }, [state, context]);

  /**
   * Update the state and screen reader after drag ends
   * @type {(...args: any[]) => any}
   */
  function handleDragEnd(dragResult) {
    let {active, over} = dragResult;

    if (active?.id == null || over?.id == null) {
      return;
    }

    dispatch({
      type: 'dragEnd',
      payload: {
        ...dragResult
      }
    });
  }

  /**
   * Callback that stores changes when the user changes the statements
   * @param statement
   */
  function handleOnStatementChange(statement) {
    dispatch({
      type: 'statementChange',
      payload: {statement}
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
  
  const statementLists = {};

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
        >
          <Column
            droppableId={"processed"}
            combine={state.isCombineEnabled}
            additionalClassName={"h5p-order-priority-dropzone"}
            prioritizedStatements={state.prioritizedStatements}
            addStatement={state.canAddPrioritized === true ? (
              <AddStatement
                onClick={() => dispatch({
                  type: "addNewPrioritizedStatement"
                })}
                translations={context.translations}
              />
            ) : null}
          >
            {state.prioritizedStatements
              .map(statementId => state.statements[statementId])
              .map((statement, index) => {
                const statementId = "prioritized-" + statement.id;
                const statementElement = (
                  <StatementList
                    key={"prioritized-" + statement.id}
                    id={"prioritized-" + statement.id}
                    draggableType="prioritized"
                    statement={statement}
                    index={index}
                    isSingleColumn={true}
                    onStatementChange={handleOnStatementChange}
                    enableEditing={context.behaviour.allowAddingOfStatements}
                    enableCommentDisplay={context.behaviour.displayCommentsBelowStatement}
                    disableTransform={state.isCombineEnabled}
                    translate={context.translate}
                  />
                );
                statementLists[statementId] = statementElement;
                return statementElement;
              })
            }
          </Column>
          {state.remainingStatements.length > 0 && (
            <Column
              droppableId="remaining"
              disableDrop={true}
              additionalClassName={"h5p-order-priority-select-list"}
              prioritizedStatements={state.remainingStatements.map(id => state.statements[id])}
              addStatement={context.behaviour && context.behaviour.allowAddingOfStatements === true ? (
                <AddStatement
                  onClick={() => dispatch({
                    type: "addNewRemainingStatement"
                  })}
                  translations={context.translations}
                />
              ) : null}
            >
              {state.remainingStatements
                .map(statementId => state.statements[statementId])
                .map((statement, index) => {
                  const statementId = "remaining-" + statement.id;
                  const statementElement = (
                    <StatementList
                      key={"remaining-" + statement.id}
                      id={"remaining-" + statement.id}
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
                }
                )
              }
            </Column>
          )}
          <DragOverlay>
            {active ? statementLists[active.id] : null}
          </DragOverlay>
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
        <p className={"visible-hidden"}>{context.translations.userInfoAboutFocusMode}</p>
        {handleSurface()}
      </div>
      {provideSummary === true && (
        <Summary/>
      )}
    </div>
  );
}

export default Surface;