import React from 'react';
import TinyPopover, { ArrowContainer } from 'react-tiny-popover';
import classnames from "classnames";
import PropTypes from "prop-types";

const Popover = ({handleClose, show, children, popoverContent}) => {
    return (
        <TinyPopover
            containerClassName={"h5p-order-priority-popover"}
            isOpen={show}
            position={['top', 'bottom']}
            windowBorderPadding={10}
            containerStyle={{
                overflow: "unset",
            }}
            align={"end"}
            onClickOutside={handleClose}
            content={({position, targetRect, popoverRect}) => (
                <ArrowContainer
                    position={position}
                    targetRect={targetRect}
                    popoverRect={popoverRect}
                    arrowColor={'black'}
                    arrowSize={10}
                >
                    <div className={"h5p-order-priority-popover-content"}>
                        <div
                            onClick={handleClose}
                            className={classnames("h5p-order-priority-popover-close", {
                                "close-button-top": position === "top",
                                "close-button-bottom": position === "bottom",
                            })}>
                                <span className={"close-button"}>
                                    <i className={"fa fa-close"} />
                                </span>
                        </div>
                        <div>
                            {popoverContent}
                        </div>
                    </div>
                </ArrowContainer>
            )}
        >
            {children}
        </TinyPopover>
    );
};

Popover.propTypes = {
    handleClose: PropTypes.func.isRequired,
    show: PropTypes.bool,
    popoverContent: PropTypes.object,
};

export default Popover;
