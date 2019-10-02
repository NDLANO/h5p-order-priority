import React from 'react';
import PropTypes from 'prop-types';

function AddStatement(props) {
    const {
        translations,
        onClick
    } = props;

    return (
        <div>
            <button
                type={"button"}
                className={"h5p-order-priority-add"}
                onClick={onClick}
            >
                <span className={"fa fa-pencil"} aria-hidden={"true"}/>
                <span>{translations.add}</span>
            </button>
        </div>
    );
}

AddStatement.propTypes = {
    translations: PropTypes.object,
    onClick: PropTypes.func,
};

export default AddStatement;