import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import classsnames from 'classnames';

function StatementComment(props) {

    const inputRef = props.inputRef || useRef();

    function handleOnChange(event){
        props.onCommentChange(inputRef.current.value);
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = inputRef.current.scrollHeight + "px";
        if( event.keyCode === 9){
            return false;
        }
    }

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
                    onChange={handleOnChange}
                    onBlur={handleOnChange}
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