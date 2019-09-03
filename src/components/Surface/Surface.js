import React, {Fragment} from 'react';
import {OrderPriorityContext} from '../../context/OrderPriorityContext';
import {DragDropContext} from 'react-beautiful-dnd';
import Column from '../Column/Column';
import StatementList from "../StatementList/StatementList";
import AddStatement from "../AddStatement/AddStatement";

function StatementDataObject(initValues) {
    this.id = null;
    this.comment = null;
    this.displayIndex = null;
    this.added = false;
    this.statement = null;
    this.isPlaceholder = false;
    this.isUserAdded = false;
    this.editMode = false;
    this.touched = false;
    return Object.assign(this, initValues);
}

export default class Surface extends React.Component {

    static contextType = OrderPriorityContext;

    state = {
        statements: [],
        prioritizedStatements: [],
        remainingStatements: [],
        showOneColumn: false,
        isCombineEnabled: true,
    };

    constructor(props) {
        super(props);

        this.init = this.init.bind(this);
        this.onDropEnd = this.onDropEnd.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDropUpdate = this.onDropUpdate.bind(this);
        this.sendExportValues = this.sendExportValues.bind(this);
        this.handleOnStatementChange = this.handleOnStatementChange.bind(this);
        this.handleOnAddNewItem = this.handleOnAddNewItem.bind(this);
    }

    onDragStart(element) {
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
        } else {
            const statementId = remainingStatements[source.index];
            const draggedStatement = newStatements[statementId];
            const draggedIndex = prioritizedStatements.indexOf(statementId);
            let droppedIndex = null;
            if (combine !== null) {
                droppedIndex = prioritizedStatements.indexOf(parseInt(combine.draggableId.replace("prioritized-", ""), 10));
            } else {
                droppedIndex = destination.index < prioritizedStatements.length ? destination.index : prioritizedStatements.length - 1;
            }
            if (droppedIndex !== -1 && draggedIndex !== -1) {
                [prioritizedStatements[droppedIndex], prioritizedStatements[draggedIndex]] = [prioritizedStatements[draggedIndex], prioritizedStatements[droppedIndex]];
            } else if (draggedIndex === -1) {
                prioritizedStatements.splice(droppedIndex, 0, statementId);
                const untouched = prioritizedStatements
                    .filter(elementId => elementId !== statementId && newStatements[elementId].touched === false)
                    .pop();
                if (untouched !== undefined) {
                    prioritizedStatements.splice(prioritizedStatements.indexOf(untouched), 1);
                } else {
                    remainingStatements.push(prioritizedStatements.pop());
                }
            }

            if (remainingStatements.length > 0 && source.droppableId !== 'processed') {
                remainingStatements.splice(source.index, 1);
            }
            draggedStatement.isPlaceholder = destination === 'processed';
            draggedStatement.touched = true;
        }

        prioritizedStatements.forEach((statementId, index) => newStatements[statementId].displayIndex = index + 1);

        this.setState({
            statements: newStatements,
            prioritizedStatements: prioritizedStatements,
            remainingStatements: remainingStatements,
            showOneColumn: remainingStatements.length === 0,
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
        }
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
                numberOfStatements = statementsList.length
            },
            behaviour: {
                prepopulate = false,
                randomizeStatements = false,
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
            if (statement !== null) {
                return new StatementDataObject({
                    id: index,
                    statement,
                    isPlaceholder: !prepopulate,
                    displayIndex: index + 1,
                });
            }
            return new StatementDataObject({
                id: index,
                added: true,
                isPlaceholder: true,
                displayIndex: index + 1,
            });

        });

        this.setState({
            statements: statements,
            remainingStatements: prepopulate === true ? statements.slice(numberOfStatements).map(statement => statement.id) : statements.map(statement => statement.id).filter(statementId => statements[statementId].added === false),
            prioritizedStatements: statements.map(statement => parseInt(statement.id)).filter(statementId => statements[statementId].displayIndex <= numberOfStatements),
            showOneColumn: prepopulate,
        });
    }

    handleOnStatementChange(statement) {
        const statements = Array.from(this.state.statements);
        statements[statement.id] = statement;
        this.setState({
            statements
        })
    }

    handleOnAddNewItem() {
        const statements = Array.from(this.state.statements);
        const remainingStatements = Array.from(this.state.remainingStatements);
        const id = statements.length;
        const newItem = new StatementDataObject({
            id: id,
            added: true,
            isUserAdded: true,
            editMode: true,
            statement: "",
        });

        statements.push(newItem);
        remainingStatements.push(id);

        this.setState({
            statements,
            remainingStatements,
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
                            />
                        ))
                    }
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
                                />
                            ))
                        }
                        {this.context.behaviour && this.context.behaviour.allowAddingOfStatements === true && (
                            <AddStatement
                                onClick={this.handleOnAddNewItem}
                                translations={{add: "Add"}}
                            />
                        )}
                    </Column>
                )}
            </Fragment>
        );
    }

    render() {
        return (
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
        );
    }
}