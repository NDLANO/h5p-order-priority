import React, {Fragment} from 'react';
import md5 from 'md5';
import {OrderPriorityContext} from '../../context/OrderPriorityContext';
import {DragDropContext} from 'react-beautiful-dnd';
import Column from '../Column/Column';
import StatementList from "../StatementList/StatementList";

function StatementDataObject(initValues){
    this.id = null;
    this.comment = null;
    this.displayIndex = null;
    this.added = false;
    this.statement  = null;
    this.isPlaceholder = false;
    return Object.assign(this, initValues);
}

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
        const newStatements = Array.from(this.state.statements);

        draggableId = parseInt(draggableId.replace(/\w+-/, ""), 10);
        if (source && destination && source.droppableId === destination.droppableId) {
            prioritizedStatements.splice(source.index, 1);
            prioritizedStatements.splice(destination.index, 0, draggableId);
        } else {
            const statementId = remainingStatements[source.index];
            let droppedIndex = null;
            let splicedElement = null;
            if (combine !== null) {
                droppedIndex = prioritizedStatements.indexOf(parseInt(combine.draggableId.replace("prioritized-", ""), 10));
            } else {
                droppedIndex = destination.index < prioritizedStatements.length ? destination.index : prioritizedStatements.length - 1;
            }
            let draggedIndex = prioritizedStatements.indexOf(statementId);
            if (droppedIndex !== null && draggedIndex !== -1) {
                [prioritizedStatements[droppedIndex], prioritizedStatements[draggedIndex]] = [prioritizedStatements[draggedIndex], prioritizedStatements[droppedIndex]];
            } else if (draggedIndex === -1){
                splicedElement = prioritizedStatements.splice(droppedIndex, 1, statementId);
            }

            if (remainingStatements.length > 0 && source.droppableId !== 'processed') {
                if( splicedElement === null || remainingStatements.indexOf(splicedElement[0]) !== -1){
                    remainingStatements.splice(source.index, 1);
                } else {
                    remainingStatements.splice(source.index, 1, splicedElement[0]);
                }
            }

            if( statementId !== undefined){
                const draggedStatement = new StatementDataObject(this.state.statements[draggableId]);
                draggedStatement.isPlaceholder = destination === 'processed';
                newStatements[statementId] = draggedStatement;
            }
        }

        prioritizedStatements.forEach((statementId, index) => newStatements[statementId].displayIndex = index + 1);

        this.setState({
            statements: newStatements,
            prioritizedStatements: prioritizedStatements,
            remainingStatements: remainingStatements,
            showOneColumn: remainingStatements.length === 0,
        }, this.context.trigger('resize'));
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
                prepopulate = false,
                numberOfStatements
            }
        } = this.context;

        const statements = statementsList.map((statement, index) => {
            return new StatementDataObject({
                id: index,
                statement,
                isPlaceholder: !prepopulate,
                displayIndex: index + 1,
            });
        });

        if( numberOfStatements > statementsList.length ){
            for (let i = statementsList.length; i < numberOfStatements; i++){
                statements.push(new StatementDataObject({
                    id: i,
                    added: true,
                    isPlaceholder: true,
                    displayIndex: i + 1,
                }));
            }
        }

        this.setState({
            statements: statements,
            remainingStatements: prepopulate === true ? [] : statements.map(statement => parseInt(statement.id)).filter(statementId => statements[statementId].added === false),
            prioritizedStatements: statements.map(statement => parseInt(statement.id)).filter(statementId => statements[statementId].displayIndex <= numberOfStatements), // numberOfStatements >= statementsList.length ? Object.keys(statements) : Object.keys(statements).filter(statementId => statements[statementId].displayIndex <= numberOfStatements),
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

    handleSurface() {
        return (
            <Fragment>
                <Column
                    droppableId={"processed"}
                    combine={!this.state.showOneColumn}
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
                                displayIndex={statement.displayIndex}
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