import React, { Fragment, useState } from 'react';
import { useOrderPriority } from '@context/OrderPriorityContext.js';
import './Reset.scss';

/**
 * Reset dialog.
 * @returns {object} JSX element.
 */
const Reset = () => {
  const [isShowingDialog, setShowingDialog] = useState(false);
  const orderPriorityContext = useOrderPriority();

  const {
    behaviour: { enableRetry = false },
    resetTask,
    translations,
  } = orderPriorityContext;

  const showConfirmationDialog = () => {
    setShowingDialog(true);

    const dialog = new H5P.ConfirmationDialog({
      headerText: translations.confirm,
      dialogText: translations.ifYouContinueAllYourChangesWillBeLost,
      cancelText: translations.cancel,
      confirmText: translations.continue,
      classes: ['restart']
    });

    dialog.on('confirmed', () => {
      resetTask();
      setShowingDialog(false);
    });

    dialog.on('canceled', () => {
      setShowingDialog(false);
    });

    dialog.appendTo(document.body);
    dialog.show();
  };

  return (
    <Fragment>
      {enableRetry === true && (
        <button
          className={'h5p-order-priority-footer-button h5p-order-priority-button-restart'}
          onClick={showConfirmationDialog}
          aria-haspopup={'true'}
          aria-expanded={isShowingDialog}
        >
          <span className={'h5p-ri hri-restart'} />
          {translations.restart}
        </button>
      )}
    </Fragment>
  );
};

export default Reset;
