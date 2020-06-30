import React, {useEffect, useRef, useState} from 'react';
import TinyPopover, { ArrowContainer } from 'react-tiny-popover';
import PropTypes from "prop-types";

/**
 * Component to display a popover with trap. Used third party component Tinypopover.
 *
 * @param handleClose
 * @param show
 * @param children
 * @param popoverContent
 * @param classnames
 * @param header
 * @param close
 * @param align
 * @param lastActiveElement
 * @return {*}
 * @constructor
 */
const Popover = ({handleClose, show, children, popoverContent, classnames = [], header, close, align = "end", lastActiveElement}) => {
  classnames.push("h5p-order-priority-popover");

  const [firstTabElement, setFirstTabElements] = useState(null);
  const [lastTabElement, setLastTabElements] = useState(null);
  const modalRef = useRef(null);
  const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

  const onClose = () => {
    handleClose();
  };

  /**
   * Make sure the user cannot press the tab key and exit the popover
   * @param e
   */
  const trapKeys = (e) => {
    if (e.keyCode === 9) {
      if (e.shiftKey) {
        if (document.activeElement === firstTabElement) {
          e.preventDefault();
          lastTabElement.focus();
        }
      }
      else {
        if (document.activeElement === lastTabElement) {
          e.preventDefault();
          firstTabElement.focus();
        }
      }
    }
    if (e.keyCode === 27) {
      onClose();
    }
  };

  useEffect(() => {
    if ( show ) {
      setTimeout(() => {
        const focusableElements = Array.from(modalRef.current.querySelectorAll(focusableElementsString));
        setFirstTabElements(focusableElements[0]);
        setLastTabElements(focusableElements[focusableElements.length - 1]);
      }, 0);
    }
    else {
      if ( lastActiveElement ) {
        lastActiveElement.focus();
      }
    }
  }, [show]);

  useEffect(() => {
    if ( show ) {
      firstTabElement.focus();
    }
  }, [firstTabElement]);

  return (
    <TinyPopover
      containerClassName={classnames.join(" ")}
      isOpen={show}
      position={['top', 'bottom']}
      windowBorderPadding={10}
      containerStyle={{
        overflow: "unset",
      }}
      align={align}
      onClickOutside={onClose}
      content={({position, targetRect, popoverRect}) => (
        <div
          ref={modalRef}
        >
          <ArrowContainer
            position={position}
            targetRect={targetRect}
            popoverRect={popoverRect}
            arrowColor={'white'}
            arrowSize={10}
          >
            <div
              onKeyDown={trapKeys}
              tabIndex={"-1"}
              role={"dialog"}
              className={"h5p-order-priority-popover-container"}
              aria-modal={"true"}
            >
              <div className={"h5p-order-priority-popover-header"}>
                <div>
                  {header}
                </div>
                <button
                  onClick={onClose}
                  className={"close-button"}
                >
                  <span
                    className={"h5p-ri hri-close"}
                    aria-hidden={true}
                  />
                  <span className="visible-hidden">{close}</span>
                </button>
              </div>
              <div
                className={"h5p-order-priority-popover-content"}
              >
                {popoverContent}
              </div>
            </div>
          </ArrowContainer>
        </div>

      )}
    >
      {ref => (
        <div
          ref={ref}>
          {children}
        </div>
      )}
    </TinyPopover>
  );
};

Popover.propTypes = {
  handleClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  popoverContent: PropTypes.object,
  classnames: PropTypes.array,
  header: PropTypes.string,
  close: PropTypes.string,
  lastActiveElement: PropTypes.object,
};

export default Popover;
