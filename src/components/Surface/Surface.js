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
          result
        } = action.payload;

        const statementClone = JSON.parse(JSON.stringify(state.statements));
        const destinationIndex = result.destination.index;
        const prioritizedStatements = Array.from(state.prioritizedStatements);

        const dragged = statementClone[prioritizedStatements[result.source.index]];
        const previousDraggedIndex = dragged.displayIndex;
        dragged.displayIndex = destinationIndex + 1;
        const draggedIndexDifference = dragged.displayIndex - previousDraggedIndex;
        prioritizedStatements
          .map(statementId => statementClone[statementId])
          .map((statementClone, index) => {
            if (statementClone.displayIndex === destinationIndex + 1 && index !== result.source.index) {
              statementClone.displayIndex -= draggedIndexDifference;
            }
          });

        return {
          ...state,
          statements: statementClone
        };
      }
      case 'dragEnd': {
        // let {
        //   combine,
        //   destination,
        //   source,
        //   draggableId
        // } = action.payload;

        let {
          activatorEvent, // pointerdown {html target}
          active, // id: remaining-0, data {....}
          collisions, // [{id: prioritized-0, data {...}}, {id: processed, data {...}}, {id: remaining-0, data {...}}, {id: start, data {...}}]
          delta, // some coordination stuff
          over // {id: prioritized-0, data {...}}
        } = action.payload;

        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const remainingStatements = Array.from(state.remainingStatements);
        const newStatements = JSON.parse(JSON.stringify(state.statements));
        const [activeString, activeId] = active.id.toString().split('-') ?? [];
        const [overString, overId] = over.id.toString().split('-') ?? [];
        const index = remainingStatements.indexOf(parseInt(activeId));
        const draggedElement = newStatements[activeId];
        const droppedElement = newStatements[parseInt(overId)];

        if (draggingOverFromRemainingToPrioritized(active, over)) {
          if (isDraggedElementFromRemaining(draggedElement) && isDroppingOnAlreadyPrioritizedStatement(droppedElement)) {
            draggedElement.isPlaceholder = false;
            draggedElement.touched = true;
            droppedElement.isPlaceholder = true;
            droppedElement.touched = false;
            remainingStatements[index] = droppedElement.id;
            swapIndexPositionbetweenElements(activeId, overId, prioritizedStatements);
          }
          else if (isDraggedElementFromRemaining(draggedElement)) {
            remainingStatements.splice(index, 1);
            swapIndexPositionbetweenElements(activeId, overId, prioritizedStatements);
            draggedElement.isPlaceholder = false;
            draggedElement.touched = true;
          }
        }

        // if (source && destination && source.droppableId === destination.droppableId) {
        //   draggableId = parseInt(draggableId.replace(/\w+-/, ""), 10);
        //   prioritizedStatements.splice(source.index, 1);
        //   prioritizedStatements.splice(destination.index, 0, draggableId);
        // }
        // else {
        //   const statementId = remainingStatements[source.index];
        //   const draggedStatement = newStatements[statementId];
        //   const draggedIndex = prioritizedStatements.indexOf(statementId);
        //   let droppedIndex = null;
        //   if (combine !== null) {
        //     droppedIndex = prioritizedStatements.indexOf(parseInt(combine.draggableId.replace("prioritized-", ""), 10));
        //   }
        //   else {
        //     droppedIndex = destination.index < prioritizedStatements.length ? destination.index : prioritizedStatements.length - 1;M;
        //   }

        //   const droppedOnStatement = newStatements[prioritizedStatements[droppedIndex]];
        //   if (droppedIndex !== -1 && draggedIndex !== -1) {
        //     [prioritizedStatements[droppedIndex], prioritizedStatements[draggedIndex]] = [prioritizedStatements[draggedIndex], prioritizedStatements[droppedIndex]];
        //   }
        //   else if (draggedIndex === -1) {
        //     prioritizedStatements.splice(droppedIndex, 1, statementId);
        //   }

        //   if ( droppedOnStatement.touched === true) {
        //     remainingStatements.push(droppedOnStatement.id);
        //     droppedOnStatement.touched = false;
        //     droppedOnStatement.isPlaceholder = true;
        //   }

        //   if (remainingStatements.length > 0 && source.droppableId !== 'processed') { //     remainingStatements.splice(source.index, 1);
        //   }

        //   draggedStatement.isPlaceholder = destination === 'processed';
        //   draggedStatement.touched = true;
        // }

        prioritizedStatements.forEach((statementId, index) => {
          newStatements[statementId].displayIndex = index + 1;
        });

        // console.log(
        //   {
        //   ...state,
        //   statements: newStatements, // Statements
        //   prioritizedStatements: prioritizedStatements, // [0,1]
        //   remainingStatements: remainingStatements, // [0,1]
        //   showOneColumn: remainingStatements.length === 0, // boolean
        //   canAddPrioritized: remainingStatements.length === 0 && context.behaviour.allowAddingOfStatements && prioritizedStatements.filter(statement => !newStatements[statement.id].touched).length > 0, // boolean
        //   }
        // )

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

  /**
   * Update state and screen reader when starting the drag
   *
   * @type {(...args: any[]) => any}
   */
  // const onDragStart = useCallback((element, provider) => {

  //   const listDetails = getListDetails(element.source.droppableId, element.source);
  //   provider.announce(translate("dragStartInstructions", Messages.positionLengthName(listDetails)));

  //   dispatch({
  //     type: 'dragStart',
  //     payload: element,
  //   });
  // }, [state, context]);

  const [active, setActive] = React.useState(null);
  const handleDragStart = ({ acitve }) => {
    setActive(acitve);
  };

  /**
   * UUpdate state and screen reader during the drag
   *
   * @type {(...args: any[]) => any}
   */
  const onDragUpdate = useCallback((result, provider) => {

    if (result.destination && result.source) {
      const sourceDetails = getListDetails(result.source.droppableId, result.source);
      const destinationDetails = getListDetails(result.destination.droppableId, result.destination);
      if ( sourceDetails.listId === destinationDetails.listId) {
        provider.announce(translate("dragMoveInSameList", Messages.startEndLength(sourceDetails, destinationDetails)));
      }
      else {
        provider.announce(translate("dragMoveInDifferentList", Messages.namesPositionsLengths(sourceDetails, destinationDetails)));
      }
    }

    if (!result.destination || (result.source && result.source.droppableId === 'start')) {
      return;
    }

    dispatch({
      type: 'dragUpdate',
      payload: {
        result
      },
    });
  }, [state, context]);

  /**
   * Update the state and screen reader after drag ends
   * @type {(...args: any[]) => any}
   */
  function handleDragEnd(dragResult) {
    let {active, over} = dragResult;

    if (active?.id == null || over?.id == null) {
      return;
    }

    const [activeString, acitveIndex] = active.id.toString().split('-') ?? [];
    const [overString, overIndex] = over.id.toString().split('-') ?? [];

    const statementId = parseInt(acitveIndex, 10);
    const prioritizedId = overIndex && parseInt(overIndex, 10);

    const prioritizedStatement = state.prioritizedStatements;
    const remainingStatements = state.remainingStatements;

    // console.log("prioritzedStatement: ");
    // console.log(prioritizedStatement);
    // console.log("remainingStatements: ");
    // console.log(remainingStatements);

    // Hvis en drar kortet fra remaining til prioritized
    // if (activeString === "remaining" && overString === "prioritized" && prioritizedStatement.includes(prioritizedStatement.find(statementId => statementId === prioritizedId))) {
    // }

    // if (source && destination) {
    //   const sourceDetails = getListDetails(source.droppableId, source);
    //   const destinationDetails = getListDetails(destination.droppableId, destination);
    //   if ( sourceDetails.listId === destinationDetails.listId) {
    //     provider.announce(translate("dropInSameList", Messages.namesPositionName(sourceDetails, destinationDetails)));
    //   }
    //   else {
    //     provider.announce(translate("dropInDifferentList", Messages.namesPositionsLengths(sourceDetails, destinationDetails)));
    //   }

    // Neste oppgave: Sjekke dette her på master og kartelegge hvilken av disse her er hva og hvordan dispatch skal trigges.

    // if (destination !== null && destination.droppableId === source.droppableId && destination.index === source.index) {
    //   const sourceDetails = getListDetails(source.droppableId, source);
    //   const destinationDetails = getListDetails(destination.droppableId, destination);
    //   provider.announce(translate("dropInSameLocation", Messages.namesPositionName(sourceDetails, destinationDetails)));
    //   return;
    // }


    // }

    dispatch({
      type: 'dragEnd',
      payload: {
        ...dragResult
      }
    });
  };





  // const onDragEnd = useCallback((dragResult, provider) => {
  //   let {
  //     combine,
  //     destination,
  //     source,
  //     reason,
  //   } = dragResult;

  //   if (reason === 'CANCEL') {
  //     const listDetails = getListDetails(source.droppableId, source);
  //     provider.announce(translate("dragCancelled", Messages.positionLengthName(listDetails)));
  //     return;
  //   }

  //   if ((!combine && !destination)) {
  //     provider.announce("Oh crap!");
  //     return;
  //   }

  //   if (destination !== null && destination.droppableId === source.droppableId && destination.index === source.index) {
  //     const sourceDetails = getListDetails(source.droppableId, source);
  //     const destinationDetails = getListDetails(destination.droppableId, destination);
  //     provider.announce(translate("dropInSameLocation", Messages.namesPositionName(sourceDetails, destinationDetails)));
  //     return;
  //   }

  //   if (source && destination) {
  //     const sourceDetails = getListDetails(source.droppableId, source);
  //     const destinationDetails = getListDetails(destination.droppableId, destination);
  //     if ( sourceDetails.listId === destinationDetails.listId) {
  //       provider.announce(translate("dropInSameList", Messages.namesPositionName(sourceDetails, destinationDetails)));
  //     }
  //     else {
  //       provider.announce(translate("dropInDifferentList", Messages.namesPositionsLengths(sourceDetails, destinationDetails)));
  //     }

  //   }

  //   dispatch({
  //     type: 'dragEnd',
  //     payload: {
  //       ...dragResult
  //     }
  //   });
  // }, [state, context]);

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
          // onDragUpdate={onDragUpdate}
          onDragStart={handleDragStart}
          dragHandleUsageInstructions={context.translations.dragHandleInstructions}
        >
          <Column
            droppableId={"processed"}
            combine={state.isCombineEnabled}
            additionalClassName={"h5p-order-priority-dropzone"}
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
              .map((statement, index) => (
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
              ))
            }
          </Column>
          {state.remainingStatements.length > 0 && (
            <Column
              droppableId="start"
              disableDrop={true}
              additionalClassName={"h5p-order-priority-select-list"}
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
                .map((statement, index) => (
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
                ))
              }
            </Column>
          )}
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
        {/* <DragOverlay>
            {active ? (
              <p>Hei på deg!</p>
            ) : null}
          </DragOverlay> */}
      </div>
      {provideSummary === true && (
        <Summary/>
      )}
    </div>
  );
}

export default Surface;