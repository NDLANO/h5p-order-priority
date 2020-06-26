import React, {Fragment, useCallback, useReducer, useEffect} from 'react';
import {useOrderPriority} from "context/OrderPriorityContext";
import {DragDropContext} from 'react-beautiful-dnd';
import Column from '../Column/Column';
import StatementList from "../StatementList/StatementList";
import AddStatement from "../AddStatement/AddStatement";
import Summary from "../Summary/Summary";
import {StatementDataObject} from "../utils";
import Messages from "./Messages";

function Surface() {
  const context = useOrderPriority();

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
        let {
          combine,
          destination,
          source,
          draggableId
        } = action.payload;

        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const remainingStatements = Array.from(state.remainingStatements);
        const newStatements = JSON.parse(JSON.stringify(state.statements));

        if (source && destination && source.droppableId === destination.droppableId) {
          draggableId = parseInt(draggableId.replace(/\w+-/, ""), 10);
          prioritizedStatements.splice(source.index, 1);
          prioritizedStatements.splice(destination.index, 0, draggableId);
        }
        else {
          const statementId = remainingStatements[source.index];
          const draggedStatement = newStatements[statementId];
          const draggedIndex = prioritizedStatements.indexOf(statementId);
          let droppedIndex = null;
          if (combine !== null) {
            droppedIndex = prioritizedStatements.indexOf(parseInt(combine.draggableId.replace("prioritized-", ""), 10));
          }
          else {
            droppedIndex = destination.index < prioritizedStatements.length ? destination.index : prioritizedStatements.length - 1;
          }

          const droppedOnStatement = newStatements[prioritizedStatements[droppedIndex]];
          if (droppedIndex !== -1 && draggedIndex !== -1) {
            [prioritizedStatements[droppedIndex], prioritizedStatements[draggedIndex]] = [prioritizedStatements[draggedIndex], prioritizedStatements[droppedIndex]];
          }
          else if (draggedIndex === -1) {
            prioritizedStatements.splice(droppedIndex, 1, statementId);
          }

          if ( droppedOnStatement.touched === true) {
            remainingStatements.push(droppedOnStatement.id);
            droppedOnStatement.touched = false;
            droppedOnStatement.isPlaceholder = true;
          }

          if (remainingStatements.length > 0 && source.droppableId !== 'processed') {
            remainingStatements.splice(source.index, 1);
          }

          draggedStatement.isPlaceholder = destination === 'processed';
          draggedStatement.touched = true;
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
          canAddPrioritized: remainingStatements.length === 0 && context.behaviour.allowAddingOfStatements && prioritizedStatements.filter(statementId => !newStatements[statementId].touched).length > 0,
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

  const memoizedReducer = useCallback(stateHeadQuarter, []);
  const [state, dispatch] = useReducer(memoizedReducer, init());

  useEffect(() => {
    context.trigger('resize');
  }, [state.remainingStatements, state.prioritizedStatements]);

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

    return {
      statements: statements,
      remainingStatements: remainingStatements.map(statement => statement.id),
      prioritizedStatements: statements.filter(statement => statement.displayIndex <= numberOfStatements || statement.touched).map(statement => statement.id),
      showOneColumn: prepopulate,
      canAddPrioritized: allowAddingOfStatements && remainingStatements.length === 0,
    };
  }

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

  const onDragStart = useCallback((element, provider) => {

    const listDetails = getListDetails(element.source.droppableId, element.source);
    provider.announce(translate("dragStartInstructions", Messages.positionLengthName(listDetails)));

    dispatch({
      type: 'dragStart',
      payload: element,
    });
  }, [state, context]);
  
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

  const onDragEnd = useCallback((dragResult, provider) => {
    let {
      combine,
      destination,
      source,
      reason,
    } = dragResult;

    if (reason === 'CANCEL') {
      const listDetails = getListDetails(source.droppableId, source);
      provider.announce(translate("dragCancelled", Messages.positionLengthName(listDetails)));
      return;
    }

    if ((!combine && !destination)) {
      provider.announce("Oh crap!");
      return;
    }

    if (destination !== null && destination.droppableId === source.droppableId && destination.index === source.index) {
      const sourceDetails = getListDetails(source.droppableId, source);
      const destinationDetails = getListDetails(destination.droppableId, destination);
      provider.announce(translate("dropInSameLocation", Messages.namesPositionName(sourceDetails, destinationDetails)));
      return;
    }

    if (source && destination) {
      const sourceDetails = getListDetails(source.droppableId, source);
      const destinationDetails = getListDetails(destination.droppableId, destination);
      if ( sourceDetails.listId === destinationDetails.listId) {
        provider.announce(translate("dropInSameList", Messages.namesPositionName(sourceDetails, destinationDetails)));
      }
      else {
        provider.announce(translate("dropInDifferentList", Messages.namesPositionsLengths(sourceDetails, destinationDetails)));
      }

    }

    dispatch({
      type: 'dragEnd',
      payload: {
        ...dragResult
      }
    });
  }, [state, context]);

  function handleOnStatementChange(statement) {
    dispatch({
      type: 'statementChange',
      payload: {statement}
    });
  }

  function createNewStatement() {
    return new StatementDataObject({
      added: true,
      isUserAdded: true,
      editMode: true,
      statement: "",
    });
  }

  function handleSurface() {
    return (
      <Fragment>
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
        <DragDropContext
          className="h5p-order-prioritySurface"
          onDragEnd={onDragEnd}
          onDragUpdate={onDragUpdate}
          onDragStart={onDragStart}
          dragHandleUsageInstructions={context.translations.dragHandleInstructions}
        >
          {handleSurface()}
        </DragDropContext>
      </div>
      {provideSummary === true && (
        <Summary/>
      )}
    </div>
  );
}

export default Surface;