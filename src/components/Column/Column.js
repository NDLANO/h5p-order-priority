import React from 'react';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

function Column(props) {
    const {
        droppableId,
        combine,
        children,
        disableDrop,
        additionalClassName,
    } = props;

    return (
        <div
            className={classnames(additionalClassName)}
        >
            <Droppable
                droppableId={droppableId}
                isCombineEnabled={combine}
                isDropDisabled={disableDrop}
            >
                {provided => {
                    return (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {children}
                            <div style={{display: !combine ? "block" : "none"}}>
                                {provided.placeholder}
                            </div>
                        </div>
                    )
                }}
            </Droppable>
        </div>
    )
}

Column.propTypes = {
    statements: PropTypes.array,
    droppableId: PropTypes.string.isRequired,
    combine: PropTypes.bool,
    disableDrop: PropTypes.bool,
    additionalClassName: PropTypes.string,
};

Column.defaultProps = {
    droppableId: null,
    combine: false,
    statements: [],
    disableDrop: false,
};

export default Column;
