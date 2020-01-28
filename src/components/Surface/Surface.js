import React, {Fragment} from 'react';
import {OrderPriorityContext} from 'context/OrderPriorityContext';
import {DragDropContext} from 'react-beautiful-dnd';
import Column from '../Column/Column';
import StatementList from "../StatementList/StatementList";
import AddStatement from "../AddStatement/AddStatement";
import Summary from "../Summary/Summary";
import {StatementDataObject} from "../utils";

export default class Surface extends React.Component {

    static contextType = OrderPriorityContext;

    state = {
      statements: [],
      prioritizedStatements: [],
      remainingStatements: [],
      showOneColumn: false,
      isCombineEnabled: true,
      canAddPrioritized: false,
    };

    constructor(props) {
      super(props);

      this.init = this.init.bind(this);
      this.onDropEnd = this.onDropEnd.bind(this);
      this.onDragStart = this.onDragStart.bind(this);
      this.onDropUpdate = this.onDropUpdate.bind(this);
      this.sendExportValues = this.sendExportValues.bind(this);
      this.handleOnStatementChange = this.handleOnStatementChange.bind(this);
      this.handleOnAddNewRemainingItem = this.handleOnAddNewRemainingItem.bind(this);
      this.handleOnAddNewPrioritizedItem = this.handleOnAddNewPrioritizedItem.bind(this);
    }

    onDragStart(element) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
      this.setState({isCombineEnabled: element.source.droppableId !== 'processed'});
    }

    onDropUpdate(result) {
      if (!result.destination || (result.source && result.source.droppableId === 'start')) {
        return;
      }

      const {
        statements
      } = this.state;

      const statementClone = JSON.parse(JSON.stringify(statements));
      const destinationIndex = result.destination.index;
      const prioritizedStatements = Array.from(this.state.prioritizedStatements);

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

      this.setState({
        statements: statementClone,
      });
    }

    onDropEnd(dragResult) {
      let {
        combine,
        destination,
        source,
        draggableId
      } = dragResult;

      if (!combine && !destination) {
        return;
      }

      if (destination !== null && destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }
      const prioritizedStatements = Array.from(this.state.prioritizedStatements);
      const remainingStatements = Array.from(this.state.remainingStatements);
      const newStatements = JSON.parse(JSON.stringify(this.state.statements));

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

      this.setState({
        statements: newStatements,
        prioritizedStatements: prioritizedStatements,
        remainingStatements: remainingStatements,
        showOneColumn: remainingStatements.length === 0,
        canAddPrioritized: remainingStatements.length === 0 && this.context.behaviour.allowAddingOfStatements && prioritizedStatements.filter(statementId => !newStatements[statementId].touched).length > 0,
      }, () => this.context.trigger('resize'));
    }

    sendExportValues() {
      const {
        statements,
        prioritizedStatements,
      } = this.state;
      return {
        statements,
        prioritizedStatements,
      };
    }

    componentDidMount() {
      const {
        registerReset,
        collectExportValues,
      } = this.context;
      this.init();

      registerReset(this.init);
      collectExportValues('userInput', this.sendExportValues);
    }

    init() {
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
      } = this.context;

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

      this.setState({
        statements: statements,
        remainingStatements: remainingStatements.map(statement => statement.id),
        prioritizedStatements: statements.filter(statement => statement.displayIndex <= numberOfStatements || statement.touched).map(statement => statement.id),
        showOneColumn: prepopulate,
        canAddPrioritized: allowAddingOfStatements && statements.filter(statement => statement.touched).length < statements.length && remainingStatements.length === 0,
      });
    }

    handleOnStatementChange(statement) {
      const statements = Array.from(this.state.statements);
      statements[statement.id] = statement;
      this.setState({
        statements
      }, () => this.context.trigger('resize'));
    }

    addNewStatement() {
      const statements = JSON.parse(JSON.stringify(this.state.statements));
      const id = statements.length;
      const newItem = new StatementDataObject({
        id: id,
        added: true,
        isUserAdded: true,
        editMode: true,
        statement: "",
      });
      statements.push(newItem);
      return [statements, id];
    }

    handleOnAddNewRemainingItem() {
      const [statements, id] = this.addNewStatement();
      const remainingStatements = Array.from(this.state.remainingStatements);
      remainingStatements.push(id);

      this.setState({
        statements,
        remainingStatements,
      }, () => this.context.trigger('resize'));
    }

    handleOnAddNewPrioritizedItem() {
      const statements = JSON.parse(JSON.stringify(this.state.statements));
      const prioritizedStatements = Array.from(this.state.prioritizedStatements);
      const untouched = prioritizedStatements.filter(elementId => statements[elementId].touched === false);

      if ( untouched.length > 0) {
        const statementId = untouched.shift();
        statements[statementId].editMode = true;
        statements[statementId].touched = true;
        statements[statementId].isPlaceholder = false;
      }

      this.setState({
        statements,
        canAddPrioritized: untouched.length > 0,
      }, () => this.context.trigger('resize'));
    }

    handleSurface() {
      return (
        <Fragment>
          <Column
            droppableId={"processed"}
            combine={this.state.isCombineEnabled}
            additionalClassName={"h5p-order-priority-dropzone"}
          >
            {this.state.prioritizedStatements
              .map(statementId => this.state.statements[statementId])
              .map((statement, index) => (
                <StatementList
                  key={"prioritized-" + statement.id}
                  draggableType="prioritized"
                  statement={statement}
                  index={index}
                  isSingleColumn={true}
                  onStatementChange={this.handleOnStatementChange}
                  enableEditing={this.context.behaviour.allowAddingOfStatements}
                  enableCommentDisplay={this.context.behaviour.displayCommentsBelowStatement}
                  disableTransform={this.state.isCombineEnabled}
                  translate={this.context.translate}
                />
              ))
            }
            {this.state.canAddPrioritized === true && (
              <AddStatement
                onClick={this.handleOnAddNewPrioritizedItem}
                translations={this.context.translations}
              />
            )}
          </Column>
          {this.state.remainingStatements.length > 0 && (
            <Column
              droppableId="start"
              disableDrop={true}
              additionalClassName={"h5p-order-priority-select-list"}
            >
              {this.state.remainingStatements
                .map(statementId => this.state.statements[statementId])
                .map((statement, index) => (
                  <StatementList
                    key={"remaining-" + statement.id}
                    draggableType="remaining"
                    statement={statement}
                    index={index}
                    onStatementChange={this.handleOnStatementChange}
                    enableEditing={this.context.behaviour.allowAddingOfStatements}
                    translate={this.context.translate}
                  />
                ))
              }
              {this.context.behaviour && this.context.behaviour.allowAddingOfStatements === true && (
                <AddStatement
                  onClick={this.handleOnAddNewRemainingItem}
                  translations={this.context.translations}
                />
              )}
            </Column>
          )}
        </Fragment>
      );
    }

    render() {
      const {
        behaviour: {
          provideSummary = true,
        }
      } = this.context;

      return (
        <div>
          <div
            className="h5p-order-prioritySurface"
          >
            <DragDropContext
              className="h5p-order-prioritySurface"
              onDragEnd={this.onDropEnd}
              onDragUpdate={this.onDropUpdate}
              onDragStart={this.onDragStart}
            >
              {this.handleSurface()}
            </DragDropContext>
          </div>
          {provideSummary === true && (
            <Summary/>
          )}
        </div>
      );
    }
}