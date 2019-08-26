import React, {Fragment} from 'react';
import md5 from 'md5';
import {OrderPriorityContext} from '../../context/OrderPriorityContext';
import {DragDropContext} from 'react-beautiful-dnd';
import Column from '../Column/Column';
import StatementList from "../StatementList/StatementList";

export default class Surface extends React.Component {

    static contextType = OrderPriorityContext;

    state = {
        statements: [],
        prioritizedStatements: [],
        remainingStatements: [],
        showOneColumn: false,
    };

    constructor(props) {
        super(props);

        this.init = this.init.bind(this);
        this.onDropEnd = this.onDropEnd.bind(this);
        this.onDropUpdate = this.onDropUpdate.bind(this);
        this.sendExportValues = this.sendExportValues.bind(this);
        this.handleOnStatementChange = this.handleOnStatementChange.bind(this);
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

        let droppedIndex = null, draggedIndex;
        draggableId = draggableId.replace(/\w+-/, "");
        if (combine !== null) {
            const droppedOnId = combine.draggableId.replace("prioritized-", "");
            droppedIndex = prioritizedStatements.indexOf(droppedOnId);
            draggedIndex = prioritizedStatements.indexOf(draggableId);
        } else {
            if (source.droppableId === destination.droppableId) {
                prioritizedStatements.splice(source.index, 1);
                prioritizedStatements.splice(destination.index, 0, draggableId);
            } else {
                droppedIndex = destination.index < prioritizedStatements.length ? destination.index : prioritizedStatements.length - 1;
                draggedIndex = prioritizedStatements.indexOf(draggableId);
            }
        }

        if (droppedIndex !== null) {
            [prioritizedStatements[droppedIndex], prioritizedStatements[draggedIndex]] = [prioritizedStatements[draggedIndex], prioritizedStatements[droppedIndex]];
        }

        if (remainingStatements.length > 0 && source.droppableId !== 'processed') {
            remainingStatements.splice(source.index, 1);
        }

        const draggedStatement = Object.assign({}, this.state.statements[draggableId]);
        draggedStatement.isPlaceholder = destination === 'processed';

        const newStatements = Object.assign({}, {
            ...this.state.statements,
            [draggableId]: draggedStatement
        });
        prioritizedStatements.forEach((statementId, index) => newStatements[statementId].displayIndex = index + 1);

        this.setState({
            statements: newStatements,
            prioritizedStatements: prioritizedStatements,
            remainingStatements: remainingStatements,
            showOneColumn: remainingStatements.length === 0,
        });
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
            },
            behaviour: {
                prepopulate: prepopulated = false
            }
        } = this.context;

        const statements = statementsList.reduce((existing, current, index) => {
            const id = md5(current);
            existing[id] = {
                id: id,
                statement: current,
                isPlaceholder: !prepopulated,
                comment: null,
                displayIndex: index + 1,
            };
            return existing;
        }, {});

//        console.log(statements);

        this.setState({
            statements: statements,
            remainingStatements: prepopulated === true ? [] : Object.keys(statements),
            prioritizedStatements: Object.keys(statements),
            showOneColumn: prepopulated,
        });
    }

    handleOnStatementChange(statement) {
        this.setState({
            statements: {
                ...this.state.statements,
                [statement.id]: statement
            }
        })
    }

    handleSurface() {
        return (
            <Fragment>
                <Column
                    droppableId={"processed"}
                    combine={!this.state.showOneColumn}
                    columnType="prioritized"
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
                                displayIndex={statement.displayIndex}
                            />
                        ))
                    }
                </Column>
                {this.state.remainingStatements.length > 0 && (
                    <Column
                        droppableId="start"
                        disableDrop={true}
                        columnType="remaining"
                    >
                        {this.state.remainingStatements
                            .map(statementId => this.state.statements[statementId])
                            .map((statement, index) => (
                                <StatementList
                                    key={"remaining-" + statement.id}
                                    draggableType="remaining"
                                    statement={statement}
                                    index={index}
                                />
                            ))
                        }
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
                >
                    {this.handleSurface()}
                </DragDropContext>
            </div>
        );
    }
}