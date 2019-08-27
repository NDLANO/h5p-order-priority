import React from 'react';
import classnames from 'classnames';
import { OrderPriorityContext } from "../../context/OrderPriorityContext";

export default class Summary extends React.PureComponent {

    static contextType = OrderPriorityContext;

    constructor(props){
        super(props);
        this.state = Summary.getInitState();

        this.handleReset = this.handleReset.bind(this);
        this.sendExportValues = this.sendExportValues.bind(this);
    }

    sendExportValues() {
        return this.state.comment;
    }

    componentDidMount() {
        const {
            registerReset,
            collectExportValues,
        } = this.context;

        collectExportValues('summary', this.sendExportValues);
        registerReset(this.handleReset);
    }

    static getInitState() {
        return {
            comment: ''
        }
    }

    handleReset(){
        this.setState(Summary.getInitState())
    }

    render() {
        const {
            translations,
        } = this.context;

        return (
            <div className={classnames('h5p-order-priority-summary')}>
                <p>{translations.summary}</p>
                <textarea
                    placeholder={translations.typeYourReasonsForSuchAnswers}
                    value={this.state.comment}
                    onChange={event => this.setState({comment: event.target.value})}
                />
            </div>
        );
    }
};
