import React from 'react';
import PropTypes from 'prop-types';

function StatementComment(props) {

    const inputRef = props.inputRef;

    function handleKeyDown(){
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }

    setTimeout(handleKeyDown, 0);
    return (
        <div
            className={"h5p-order-priority-statement-comment"}
        >
            <div>
                <i
                    className={"fa fa-commenting-o"}
                />
                <textarea
                    ref={inputRef}
                    value={props.comment}
                    onKeyDown={handleKeyDown}
                    onChange={() => props.onCommentChange(inputRef.current.value)}
                />
            </div>
        </div>
    )
}

StatementComment.propTypes = {
    comment: PropTypes.string,
    onCommentChange: PropTypes.func,
    inputRef: PropTypes.object,
};

export default StatementComment;