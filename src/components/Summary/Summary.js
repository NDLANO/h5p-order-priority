import React, {useState, useContext} from 'react';
import classnames from 'classnames';
import {OrderPriorityContext} from 'context/OrderPriorityContext';
import ReactHtmlParser from "react-html-parser";

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
      aria-labelledby={"summary-header"}
    >
      <label
        id={"summary-header"}
        htmlFor={'summary'}
      >
        <h2>{summaryHeader ? summaryHeader : translate('summary')}</h2>
      </label>
      {summaryInstruction && (
        <div className={"h5p-order-priority-summary-instruction"}>{ReactHtmlParser(summaryInstruction)}</div>
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
