import classnames from 'classnames';
import React, { Fragment, useCallback, useReducer, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  PointerSensor,
  KeyboardSensor
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { useOrderPriority } from '@context/OrderPriorityContext.js';
import { StatementDataObject } from '@services/utils.js';
import Column from './components/Column/Column.js';
import StatementList from './components/StatementList/StatementList.js';
import AddStatement from './components/StatementList/components/components/AddStatement.js';
import Summary from './components/Summary/Summary.js';
import Messages from './Messages.js';
import Comment from './components/StatementList/components/components/Comment.js';
import Prioritized from './components/StatementList/components/Prioritized.js';
import './Surface.scss';

/**
 * Surface component.
 * @returns {object} JSX element.
 */
const Surface = () => {
  const context = useOrderPriority();

  const isDroppingOnAlreadyPrioritizedStatement = (draggedElement) => {
    return draggedElement.isPlaceholder === false;
  };

  const draggingOverFromRemainingToPrioritized = (active, over) => {
    if (active === undefined || over === undefined) {
      return false;
    }
    const [activeString] = active.id.toString().split('-') ?? [];
    const [overString] = over.id.toString().split('-') ?? [];

    return activeString === 'remaining' && overString === 'prioritized';
  };

  const isDraggedElementFromRemaining = (dragged) => {
    if (dragged === undefined) {
      return false;
    }

    return dragged.isPlaceholder === true;
  };

  const isArrangingPrioritizedStatements = (active, over) => {
    const [activeString] = active.id.toString().split('-') ?? [];
    const [overString] = over.id.toString().split('-') ?? [];

    return activeString === 'prioritized' && overString === 'prioritized';
  };

  const swapIndexPositionbetweenElements = (activeId, overId, prioritizedStatements) => {
    const droppedIndex = prioritizedStatements.indexOf(parseInt(overId));
    const tempIndex = prioritizedStatements.indexOf(parseInt(activeId));
    [prioritizedStatements[tempIndex], prioritizedStatements[droppedIndex]] = [prioritizedStatements[droppedIndex], prioritizedStatements[tempIndex]];
    prioritizedStatements[droppedIndex] = parseInt(activeId);
  };

  /**
   * Initialize the content type
   * @returns {object} Configuration.
   */
  const init = useCallback(() => {
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
        statementObject.touched = (
          prepopulate &&
          statementObject.displayIndex <= numberOfStatements
        );
      }
      else {
        statementObject.isPlaceholder = true;
        statementObject.added = true;
      }
      return statementObject;
    });

    const remainingStatements = prepopulate === true ?
      statements.slice(numberOfStatements) :
      statements.filter((statement) => statement.added === false);

    const prioritizedStatements = statements.filter((statement) => {
      return statement.displayIndex <= numberOfStatements || statement.touched;
    });

    return {
      statements: statements,
      remainingStatements: remainingStatements
        .map((statement) => statement.id),
      prioritizedStatements: prioritizedStatements
        .map((statement) => statement.id),
      showOneColumn: prepopulate,
      canAddPrioritized: allowAddingOfStatements && !remainingStatements.length
    };
  }, [context]);

  /**
   * Create new StatementDataObject when adding custom statements.
   * @returns {StatementDataObject} Statement data object.
   */
  const createNewStatement = () => {
    return new StatementDataObject({
      added: true,
      isUserAdded: true,
      editMode: true,
      statement: '',
    });
  };

  /**
   * Handle all updates in state for content type.
   * @param {object} state State.
   * @param {object} action Action.
   * @returns {object} New state.
   */
  const stateHeadQuarter = (state, action) => {
    switch (action.type) {
      case 'dragUpdate': {
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
          statementClone
            .find((statement) => statement.id === dragged.id)
            .displayIndex = dropped.displayIndex;

          statementClone
            .find((statement) => statement.id === dropped.id)
            .displayIndex = previousDraggedIndex;

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

      case 'dragEnd': {
        let { active, over } = action.payload;

        const prioritizedStatements = Array.from(state.prioritizedStatements);
        const remainingStatements = Array.from(state.remainingStatements);
        const newStatements = JSON.parse(JSON.stringify(state.statements));
        const [, activeId] = active.id.toString().split('-') ?? [];
        const [, overId] = over.id.toString().split('-') ?? [];
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

      case 'statementChange': {
        const { statement } = action.payload;
        const statements = Array.from(state.statements);
        statements[statement.id] = statement;
        return {
          ...state,
          statements,
        };
      }

      case 'addNewRemainingStatement': {
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

      case 'addNewPrioritizedStatement': {
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

      case 'reset': {
        return init();
      }

      default:
        return state;
    }
  };

  const memoizedReducer = useCallback(stateHeadQuarter, [context, init]);
  const [state, dispatch] = useReducer(memoizedReducer, init());

  useEffect(() => {
    context.trigger('resize');
  }, [state.remainingStatements, context]);

  /**
   * Export values. Callback to be passed to context.
   * @returns {object} Statements.
   */
  const sendExportValues = () => {
    const prioritizedStatements = [];
    state.prioritizedStatements
      .filter((id) => !state.remainingStatements.includes(id))
      .forEach((id) => {
        prioritizedStatements.push(
          state.statements.find((statement) => statement.id === id)
        );
      });

    return {
      prioritizedStatements: prioritizedStatements
    };
  };

  const {
    collectExportValues,
    registerReset,
    behaviour: { provideSummary = true },
    translate,
  } = context;

  const effectCalled = useRef(false);

  // componentDidMount pseudo equivalent
  useEffect(() => {
    if (effectCalled.current) {
      return; // Guard to work around strict mode
    }

    effectCalled.current = true;

    registerReset(() => {
      dispatch({ type: 'reset' });
    });
    collectExportValues('userInput', sendExportValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get details for list that is provided for screen readers.
   * @param {HTMLElement} droppable Droppable.
   * @param {number} startPosition Start position.
   * @param {number} destinationPosition Destination position.
   * @returns {object} Details.
   */
  const getListDetails = (droppable, startPosition, destinationPosition) => {
    const droppableId = droppable.id;
    const [droppableType] = droppableId.split('-');

    let details = {};

    switch (droppableType) {
      case 'prioritized':
        details = {
          listSize: state.prioritizedStatements.length,
          listName: context.translations.destinationName,
        };
        break;
      case 'remaining':
        details = {
          listSize: state.remainingStatements.length,
          listName: context.translations.sourceName,
        };
        break;
    }

    return Object.assign(
      {
        listId: droppableId,
        startPosition: startPosition,
        destinationPosition: destinationPosition
      },
      droppable,
      details
    );
  };

  const [active, setActive] = React.useState(null);
  const handleDragStart = ({ active }) => {
    setActive(active);
  };

  /**
   * Update state and screen reader while dragging.
   * @param {object} dragResult Drag result.
   */
  const onDragUpdate = (dragResult) => {
    let { active, over } = dragResult;

    if (active?.id == null || over?.id == null) {
      return;
    }

    const droppedListId = over.id.toString().split('-')[0] ?? [];
    const draggedListId = active.id.toString().split('-')[0] ?? [];
    if (
      !over ||
      (over && droppedListId === 'remaining') ||
      draggedListId === 'remaining'
    ) {
      return;
    }

    dispatch({
      type: 'dragUpdate',
      payload: {
        ...dragResult,
      },
    });
  };

  /**
   * Update state and screen reader after dragging ends.
   * @param {object} dragResult Drag result.
   */
  const handleDragEnd = (dragResult) => {
    let { active, over } = dragResult;

    if (active?.id == null || over?.id == null) {
      return;
    }

    dispatch({
      type: 'dragEnd',
      payload: {
        ...dragResult,
      },
    });
  };

  /**
   * Store changes when the user changes the statements.
   * @param {object} statement Statement data.
   */
  const handleOnStatementChange = (statement) => {
    dispatch({
      type: 'statementChange',
      payload: { statement },
    });
  };

  const createPrioritizedStatementWithComment = (statement) => {
    const actions = (
      <Comment
        onCommentChange={() => {}}
        comment={statement.comment}
        onClick={null}
        ref={null}
        showCommentInPopup={true}
      />
    );

    return (
      <div
        className={classnames('h5p-order-priority-draggable-element', {
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
          translate={translate.bind(this)}
        />
      </div>
    );
  };

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
   * Sort statements and put them in appropriate columns.
   * @returns {object} JSX element.
   */
  const handleSurface = () => {
    if (!state.prioritizedStatements.length) {
      return (
        <p>
          { translate('noStatements') }
        </p>
      );
    }

    return (
      <Fragment>
        <DndContext
          className="h5p-order-prioritySurface" // TODO: Fix camel case, take care of DOM!
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
                    'dragMoveInSameList',
                    Messages.startEndLength(sourceDetails, destinationDetails)
                  );
                }
                else {
                  announcement = translate(
                    'dragMoveInDifferentList',
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
                  // TODO: Check why cryptic IDs were used and how to make this better
                  return translate('draggableItemWasDroppedOver')
                    .replace(/:itemId/, active.id)
                    .replace(/:droppableId/, over.id);
                }
                else {
                  // TODO: Check why cryptic IDs were used and how to make this better
                  return translate('draggableItemWasDropped')
                    .replace(/:itemId/, active.id);
                }
              },
              onDragCancel({ active }) {
                // TODO: Check why cryptic IDs were used and how to make this better
                return translate('draggingWasCancelled')
                  .replace(/:itemId/, active.id);
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
                      type: 'addNewPrioritizedStatement',
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
                          type: 'addNewRemainingStatement',
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
  };

  return (
    <div>
      <div
        className="h5p-order-prioritySurface" // TODO: Fix camel case, take care of DOM!
        onTouchStart={() => {}} //silly call to make it work in Apple products
      >
        <p className={'visible-hidden'}>
          {context.translations.userInfoAboutFocusMode}
        </p>
        {handleSurface()}
      </div>
      {provideSummary === true && <Summary />}
    </div>
  );
};

export default Surface;
