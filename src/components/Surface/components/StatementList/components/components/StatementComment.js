import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {useOrderPriority} from "context/OrderPriorityContext";

const StatementComment = forwardRef((props, inputRef) => {
  const context = useOrderPriority();
  
  function handleOnChange() {
    if ( inputRef === null) {
      return;
    }
    props.onCommentChange(inputRef.current.value);
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  }

  return (
    <div
      className={classnames("h5p-order-priority-statement-comment", {
        "hidden": props.show !== true
      })}
    >
      <div>
        <span
          className="h5p-ri hri-comment-full"
          aria-hidden={"true"}
        />
        <textarea
          ref={inputRef}
          value={props.comment || ""}
          onChange={handleOnChange}
          onBlur={() => props.onCommentBlur(inputRef.current.value)}
          placeholder={context.translations.typeYourReasonsForSuchAnswers}
          aria-label={context.translations.typeYourReasonsForSuchAnswers}
        />
      </div>
    </div>
  );

});

StatementComment.propTypes = {
  comment: PropTypes.string,
  onCommentChange: PropTypes.func,
  onCommentBlur: PropTypes.func,
  inputRef: PropTypes.object,
  show: PropTypes.bool,
};

StatementComment.defaultProps = {
  show: false,
};

StatementComment.displayName = "StatementComment";

export default StatementComment;