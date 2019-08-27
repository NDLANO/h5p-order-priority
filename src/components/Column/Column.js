import React from 'react';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

export default class Column extends React.Component {

    static propTypes = {
        statements: PropTypes.array,
        droppableId: PropTypes.string.isRequired,
        combine: PropTypes.bool,
        disableDrop: PropTypes.bool,
        additionalClassName: PropTypes.string,
    };

    static defaultProps = {
        droppableId: null,
        combine: false,
        statements: [],
        disableDrop: false,
    };

    render() {
        const {
            droppableId,
            combine,
            children,
            disableDrop,
            additionalClassName,
        } = this.props;

        return (
            <div
                className={classnames(additionalClassName)}
            >
                <Droppable
                    droppableId={droppableId}
                    isCombineEnabled={combine}
                    isDropDisabled={disableDrop}
                >
                    {(provided) => {
                        return (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {children}
                                {provided.placeholder}
                            </div>
                        )
                    }}
                </Droppable>
            </div>
        )
    }
}