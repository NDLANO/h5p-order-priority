import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useOrderPriority } from '@context/OrderPriorityContext.js';

/**
 * Comment displayed "inline", not in a popover
 *
 * @type {React.ComponentType<React.ClassAttributes<unknown>>}
 */
const StatementComment = React.forwardRef((props, inputRef) => {
  const context = useOrderPriority();

  function handleOnChange() {
    if ( inputRef === null) {
      return;
    }
    props.onCommentChange(inputRef.current.value);

    const oldHeight = inputRef.current.style.height;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = inputRef.current.scrollHeight + 'px';

    // Only resize iframe if height of input field changed in between renders
    if (oldHeight && oldHeight !== inputRef.current.style.height) {
      context.trigger('resize');
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  };


  return (
    <div
      className={classnames('h5p-order-priority-statement-comment', {
        'hidden': props.show !== true
      })}
    >
      <div>
        <span
          className="h5p-ri hri-comment-full"
        />
        <textarea
          ref={inputRef}
          value={props.comment || ''}
          onChange={handleOnChange}
          onBlur={() => props.onCommentBlur(inputRef.current.value)}
          placeholder={context.translations.typeYourReasonsForSuchAnswers}
          aria-label={context.translations.typeYourReasonsForSuchAnswers}
          onKeyDown={handleKeyDown}
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

StatementComment.displayName = 'StatementComment';

export default StatementComment;
