import React, { Fragment, useState, useRef, useMemo, useEffect } from "react";
import Popover from "../../../Popover/Popover";
import { useOrderPriority } from "context/OrderPriorityContext";

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
  const resetButtonRef = useRef(null);

  useEffect(() => {
    if (showPopover) {
      setPreviousFocusElement(document.activeElement);
    }
  }, [showPopover]);

  function togglePopover(event) {
    if (!resetButtonRef.current) {
      resetButtonRef.current = event?.target;
    }
    setPopover(!showPopover);
  }

  function confirmReset() {
    reset();
    togglePopover();
  }

  const openerRect = useMemo(
    () => resetButtonRef.current?.getBoundingClientRect(),
    [resetButtonRef.current]
  );

  const {
    behaviour: { enableRetry = false },
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
          openerRect={openerRect}
          popoverContent={(
            <div
              role={"dialog"}
              aria-labelledby={"resetTitle"}
              className={"h5p-order-priority-reset-modal"}
            >
              <p id={"resetTitle"}>
                {translations.ifYouContinueAllYourChangesWillBeLost}
              </p>
              <div>
                <button
                  onClick={confirmReset}
                  className={"continue"}
                  type={"button"}
                >
                  {translations.continue}
                </button>
                <button
                  onClick={togglePopover}
                  className={"cancel"}
                  type={"button"}
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
            <span className={"h5p-ri hri-restart"} />
            {translations.restart}
          </button>
        </Popover>
      )}
    </Fragment>
  );
}

export default Reset;
