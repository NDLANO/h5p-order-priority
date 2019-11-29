import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

function Summary(props) {

    const [comment, setComment] = useState('');

    const {
        reset,
        exportValues,
        translate,
        summaryHeader,
        summaryInstruction,
    } = props;

    exportValues('summary', () => comment);
    reset(() => setComment(''));

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

Summary.propTypes = {
    reset: PropTypes.func,
    exportValues: PropTypes.func,
    translate: PropTypes.func,
    summaryHeader: PropTypes.string,
    summaryInstruction: PropTypes.string,
};

export default Summary;
