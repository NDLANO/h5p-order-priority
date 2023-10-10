import React, { useState } from 'react';
import classnames from 'classnames';
import { useOrderPriority } from '@context/OrderPriorityContext.js';
import '@styles/components/Summary.scss';
import ReactHtmlParser from 'html-react-parser';

/**
 * Component for displaying summary.
 * @returns {object} JSX element.
 */
const Summary = () => {

  const context = useOrderPriority();
  const [comment, setComment] = useState('');

  const {
    registerReset,
    collectExportValues,
    translate,
    params: {
      summaryHeader,
      summaryInstruction,
    }
  } = context;

  collectExportValues('summary', () => comment);
  registerReset(() => setComment(''));

  return (
    <div
      className={classnames('h5p-order-priority-summary')}
    >
      <div className={'summary-header'}>
        {summaryHeader ? summaryHeader : translate('summary')}
      </div>
      {summaryInstruction && (
        <div className={'h5p-order-priority-summary-instruction'}>
          {ReactHtmlParser(summaryInstruction)}
        </div>
      )}
      <textarea
        id={'summary'}
        placeholder={translate('giveABriefSummary')}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        aria-label={translate('giveABriefSummary')}
      />
    </div>
  );
};

export default Summary;
