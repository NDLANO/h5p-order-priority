import React, {useState} from 'react';
import classnames from 'classnames';
import {useOrderPriority} from 'context/OrderPriorityContext';
import 'styles/components/Summary.scss';
import ReactHtmlParser from "html-react-parser";

/**
 * Component for displaying the summary
 *
 * @return {*}
 * @constructor
 */
function Summary() {

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
      <h3>{summaryHeader ? summaryHeader : translate('summary')}</h3>
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
