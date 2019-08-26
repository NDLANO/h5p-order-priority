import React from 'react';
import PropTypes from 'prop-types';
import { Draggable } from "react-beautiful-dnd";
import Remaining from "../StatementTypes/Remaining";
import Prioritized from "../StatementTypes/Prioritized";
import Placeholder from "../StatementTypes/Placeholder";
import ActionsList from "../Actions/ActionsList";
import Comment from "../Actions/Comment";

export default class StatementList extends React.Component {
    static propTypes = {
        statement: PropTypes.object,
        index: PropTypes.number.isRequired,
        draggableType: PropTypes.string.isRequired,
        isSingleColumn: PropTypes.bool,
        onStatementChange: PropTypes.func,
        displayPriorityNumbers: PropTypes.bool,
        displayIndex: PropTypes.number,
    };

    static defaultProps = {
        isSingleColumn: false,
        statement: {},
        displayPriorityNumbers: false,
    };

    constructor(props){
        super(props);

        this.handleOnCommentChange = this.handleOnCommentChange.bind(this);
    }

    handleOnCommentChange(comment) {
        const statement = Object.assign({}, this.props.statement);
        statement.comment = comment;
        this.props.onStatementChange(statement);
    }

    handleStatementType() {
        const {
            statement,
            draggableType,
            isSingleColumn,
            displayIndex,
        } = this.props;

        if (draggableType === 'remaining') {
            return (
                <Remaining
                    statement={statement.statement}
                />
            );
        } else if (draggableType === 'prioritized' && !statement.isPlaceholder) {
            let actions;
            if (isSingleColumn) {
                actions = (
                    <ActionsList>
                        <Comment
                            onCommentChange={this.handleOnCommentChange}
                        />
                    </ActionsList>
                )
            }
            return (
                <Prioritized
                    statement={statement.statement}
                    actions={actions}
                    displayIndex={displayIndex}
                />
            )
        } else if (draggableType === 'prioritized') {
            return (
                <Placeholder
                    statement={statement}
                    displayIndex={displayIndex}
                />
            );
        }
    }

    render() {
        const {
            index,
            statement,
            draggableType,
        } = this.props;

        return (
            <Draggable
                draggableId={draggableType + "-" + statement.id}
                index={index}
            >
                {provided => (
                    <div className={"h5p-order-priority-draggable-container"}>
                        <div
                            className={"h5p-order-priority-draggable-element"}
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                        >
                            {this.handleStatementType()}
                        </div>
                    </div>
                )}
            </Draggable>
        )
    }
}