import React from 'react';
import PropTypes from 'prop-types';
import {OrderPriorityContext} from "../../context/OrderPriorityContext";
import Popover from "../Popover/Popover";

export default class Comment extends React.Component {

    static contextType = OrderPriorityContext;

    static propTypes = {
        onCommentChange: PropTypes.func,
        comment: PropTypes.string,
    };

    state = {
        showPopover: false,
        comment: '',
    };

    constructor(props) {
        super(props);
        this.onToggleModal = this.onToggleModal.bind(this);
        this.handleCommentChange = this.handleCommentChange.bind(this);
    }

    onToggleModal() {
        this.setState({
            showPopover: !this.state.showPopover
        }, this.props.onCommentChange(this.state.comment))
    }

    handleCommentChange(event) {
        this.setState({
            comment: event.target.value,
        });
    }

    render() {
        const {
            translations
        } = this.context;

        return (
            <Popover
                handleClose={this.onToggleModal}
                show={this.state.showPopover}
                popoverContent={(
                    <div>
                        <textarea
                            placeholder={translations.typeYourReasonsForSuchAnswers}
                            onChange={this.handleCommentChange}
                            value={this.state.comment}
                        />
                    </div>
                )}
            >
                <div
                    onClick={this.onToggleModal}
                    className={"h5p-order-priority-action"}
                >
                    <i
                        className={"fa fa-commenting-o"}
                    />
                </div>
            </Popover>
        );
    }
}