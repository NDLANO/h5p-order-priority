import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useOrderPriority } from '@context/OrderPriorityContext.js';
import Popover from '@components/Popover/Popover.js';

const Comment = React.forwardRef((props, inputRef) => {

  const [showPopover, togglePopover] = useState(false);
  const [comment, setComment] = useState(props.comment);
  const [previousFocusElement, setPreviousFocusElement] = useState(null);

  const context = useOrderPriority();

  useEffect(() => {
    if ( showPopover ) {
      setPreviousFocusElement(document.activeElement);
      setComment(props.comment || '');
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
    }
    else {
      props.onCommentChange(comment);
    }
  }, [showPopover]);

  const handleToggle = () => {
    if (props.onClick) {
      return props.onClick();
    }
    togglePopover(!showPopover);
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  return (
    <div className={'h5p-order-priority-comment'}>
      <Popover
        handleClose={handleToggle}
        lastActiveElement={previousFocusElement}
        show={showPopover}
        classnames={context.activeBreakpoints}
        header={context.translations.feedback}
        close={context.translations.close}
        popoverContent={(
          <textarea
            ref={inputRef}
            placeholder={context.translations.typeYourReasonsForSuchAnswers}
            value={comment}
            aria-label={context.translations.typeYourReasonsForSuchAnswers}
            onChange={(event) => setComment(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
        )}
      >
        <button
          aria-haspopup={props.showCommentInPopup}
          aria-expanded={showPopover}
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
      </Popover>
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
