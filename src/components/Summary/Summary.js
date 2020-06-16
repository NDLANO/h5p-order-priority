import React, {useState, useContext} from 'react';
import classnames from 'classnames';
import {OrderPriorityContext} from 'context/OrderPriorityContext';

function Summary() {

  const context = useContext(OrderPriorityContext);
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
      <h3>{summaryHeader ? summaryHeader : translate('summary')}</h3>
      {summaryInstruction && (
        <p className={"h5p-order-priority-summary-instruction"}>{summaryInstruction}</p>
      )}
      <textarea
        id={"summary"}
        placeholder={translate('giveABriefSummary')}
        value={comment}
        onChange={event => setComment(event.target.value)}
        aria-label={translate('giveABriefSummary')}
      />
    </div>
  );
}

export default Summary;
