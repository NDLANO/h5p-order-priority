import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import classsnames from 'classnames';

function StatementComment(props) {

    const inputRef = props.inputRef || useRef();

    function handleKeyDown(){
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }

    setTimeout(handleKeyDown, 0);
    return (
        <div
            className={classsnames("h5p-order-priority-statement-comment", {
                "hidden": props.show !== true
            })}
        >
            <div>
                <i
                    className={"fa fa-commenting-o"}
                />
                <textarea
                    ref={inputRef}
                    value={props.comment || ""}
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
    show: PropTypes.bool,
};

StatementComment.defaultProps = {
    show: false,
};

export default StatementComment;