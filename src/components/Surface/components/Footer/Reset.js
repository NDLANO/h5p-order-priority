import React, {Fragment, useState, useEffect} from 'react';
import Popover from "../../../Popover/Popover";
import {useOrderPriority} from "context/OrderPriorityContext";

/**
 * If enabled the user can reset the content type and do it again
 *
 * @return {*}
 * @constructor
 */
function Reset() {

  const [showPopover, setPopover] = useState(false);
  const [previousFocusElement, setPreviousFocusElement] = useState(null);
  const orderPriorityContext = useOrderPriority();

  useEffect(() => {
    if ( showPopover ) {
      setPreviousFocusElement(document.activeElement);
    }
  }, [showPopover]);

  function togglePopover() {
    setPopover(!showPopover);
  }

  function confirmReset() {
    reset();
    togglePopover();
  }

  const {
    behaviour: {
      enableRetry = false
    },
    reset,
    translations,
  } = orderPriorityContext;

  return (
    <Fragment>
      {enableRetry === true && (
        <Popover
          handleClose={togglePopover}
          lastActiveElement={previousFocusElement}
          show={showPopover}
          classnames={orderPriorityContext.activeBreakpoints}
          close={translations.close}
          header={translations.restart}
          align={"start"}
          popoverContent={(
            <div
              className={"h5p-order-priority-reset-modal"}
            >
              <p id={"resetinfo"} >
                {translations.ifYouContinueAllYourChangesWillBeLost}
              </p>
              <div>
                <button
                  onClick={confirmReset}
                  className={"continue"}
                >
                  {translations.continue}
                </button>
                <button
                  onClick={togglePopover}
                  className={"cancel"}
                >
                  {translations.cancel}
                </button>
              </div>
            </div>
          )}
        >
          <button
            className={"h5p-order-priority-button-restart"}
            onClick={togglePopover}
            aria-haspopup={"true"}
            aria-expanded={showPopover}
          >
            <span
              className={"h5p-ri hri-restart"}
              aria-hidden={"true"}
            />
            {translations.restart}
          </button>
        </Popover>
      )}
    </Fragment>
  );
}

export default Reset;