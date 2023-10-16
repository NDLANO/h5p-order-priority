import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useOrderPriority } from '@context/OrderPriorityContext.js';
import './Comment.scss';

const Comment = React.forwardRef((props, inputRef) => {

  const [textareaShown, toggleTextarea] = useState(false);
  const [comment, setComment] = useState(props.comment);

  const context = useOrderPriority();

  useEffect(() => {
    if ( textareaShown ) {
      setComment(props.comment || '');
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
    }
    else {
      props.onCommentChange(comment);
    }
  // Adding props will lead to infinite render loops. This useEffect will
  // be removed anyway when popover is replaced
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textareaShown, comment, inputRef]);

  const handleToggle = () => {
    if (!props.onClick) {
      return;
    }
    toggleTextarea(!textareaShown);

    return props.onClick();
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  return (
    <div className={'h5p-order-priority-comment'}>
      <button
        aria-expanded={textareaShown}
        onClick={handleToggle}
        className={'h5p-order-priority-action'}
        tabIndex={props.showCommentInPopup === false && props.comment !== null && props.comment.length > 0 ? '-1' : '0'}
        onKeyDown={handleKeyDown}
      >
        <span
          className={classnames('h5p-ri', {
            'hri-comment-empty': !props.comment || props.comment.length === 0,
            'hri-comment-full': props.comment && props.comment.length > 0,
          })}
        />
        <span className="visible-hidden">{context.translations.addComment}</span>
      </button>
    </div>
  );
});

Comment.propTypes = {
  onCommentChange: PropTypes.func,
  comment: PropTypes.string,
  onClick: PropTypes.func,
  showCommentInPopup: PropTypes.bool,
};

Comment.displayName = 'Comment';

export default Comment;
