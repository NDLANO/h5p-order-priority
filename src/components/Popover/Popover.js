import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { ArrowContainer, Popover as TinyPopover } from 'react-tiny-popover';
import PropTypes from 'prop-types';

/**
 * Component to display a popover with trap. Used third party component Tinypopover.
 *
 * @param props
 * @param props.handleClose
 * @param props.show
 * @param props.children
 * @param props.popoverContent
 * @param props.classnames
 * @param props.header
 * @param props.close
 * @param props.align
 * @param props.lastActiveElement
 * @return {*}
 * @constructor
 */
const Popover = forwardRef(
  (
    {
      handleClose,
      show,
      children,
      popoverContent,
      classnames = [],
      header,
      close,
      align = 'end',
      lastActiveElement,
      openerRect,
    },
    ref
  ) => {
    classnames.push('h5p-order-priority-popover');

    const [firstTabElement, setFirstTabElements] = useState(null);
    const modalRef = useRef(null);
    const focusableElementsString =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

    const onClose = () => {
      handleClose();
    };

    useEffect(() => {
      if (show) {
        setTimeout(() => {
          const focusableElements = Array.from(
            modalRef.current.querySelectorAll(focusableElementsString)
          );
          setFirstTabElements(focusableElements[0]);
        }, 0);
      }
      else {
        if (lastActiveElement) {
          lastActiveElement.focus();
        }
      }
    }, [lastActiveElement, show]);

    useEffect(() => {
      if (show) {
        firstTabElement?.focus();
      }
    }, [firstTabElement, show]);

    return (
      <TinyPopover
        containerClassName={classnames.join(' ')}
        isOpen={show}
        positions={['top', 'bottom']}
        padding={10}
        containerStyle={{
          overflow: 'unset',
        }}
        align={align}
        onClickOutside={onClose}
        content={({ position, popoverRect }) => (
          <div ref={modalRef}>
            <ArrowContainer
              position={position}
              popoverRect={popoverRect}
              arrowColor={'white'}
              arrowSize={10}
              childRect={openerRect}
            >
              <div className={'h5p-order-priority-popover-container'}>
                <div className={'h5p-order-priority-popover-header'}>
                  <div>{header}</div>
                  <button
                    onClick={handleClose}
                    aria-label={close}
                    type={'button'}
                    className={'close-button'}
                  >
                    <span className={'h5p-ri hri-close'} />
                  </button>
                </div>
                <div className={'h5p-order-priority-popover-content'}>
                  {popoverContent}
                </div>
              </div>
            </ArrowContainer>
          </div>
        )}
      >
        <div ref={ref}>{children}</div>
      </TinyPopover>
    );
  }
);

Popover.propTypes = {
  handleClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  popoverContent: PropTypes.object,
  classnames: PropTypes.array,
  header: PropTypes.string,
  close: PropTypes.string,
  lastActiveElement: PropTypes.object,
};

Popover.displayName = 'Popover';
export default Popover;
