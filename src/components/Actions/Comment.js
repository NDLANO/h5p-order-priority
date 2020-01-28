import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import {OrderPriorityContext} from "context/OrderPriorityContext";
import Popover from "../Popover/Popover";
import classnames from 'classnames';

function Comment(props) {

  const [showPopover, togglePopover] = useState(false);
  const [comment, setComment] = useState(props.comment);

  const context = useContext(OrderPriorityContext);

  function handleToggle() {
    if (props.onClick) {
      return props.onClick();
    }
    if (!showPopover) {
      setComment(props.comment || "");
      setTimeout(() => props.inputRef.current && props.inputRef.current.focus(), 0);
    }
    else {
      props.onCommentChange(comment);
    }
    togglePopover(!showPopover);
  }

  return (
    <Popover
      handleClose={handleToggle}
      show={showPopover}
      classnames={context.activeBreakpoints}
      header={context.translations.feedback}
      close={context.translations.close}
      popoverContent={(
        <textarea
          ref={props.inputRef}
          placeholder={context.translations.typeYourReasonsForSuchAnswers}
          value={comment}
          aria-label={context.translations.typeYourReasonsForSuchAnswers}
          onChange={event => setComment(event.currentTarget.value)}
          rows={3}
        />
      )}
    >
      <button
        onClick={handleToggle}
        className={"h5p-order-priority-action"}
        onKeyDown={event => {
          if (event.keyCode === 13) {
            handleToggle();
          }
        }}
      >
        <span
          className={classnames("h5p-ri", {
            "hri-comment-empty": !props.comment || props.comment.length === 0,
            "hri-comment-full": props.comment && props.comment.length > 0,
          })}
          aria-hidden={"true"}
        />
        <span className="visible-hidden">{context.translations.addComment}</span>
      </button>
    </Popover>
  );
}

Comment.propTypes = {
  onCommentChange: PropTypes.func,
  comment: PropTypes.string,
  onClick: PropTypes.func,
  inputRef: PropTypes.object,
};

export default Comment;
