import React from 'react';
import TinyPopover, { ArrowContainer } from 'react-tiny-popover';
import PropTypes from "prop-types";

const Popover = ({handleClose, show, children, popoverContent, classnames = [], header, close, align = "end"}) => {
    classnames.push("h5p-order-priority-popover");
    return (
        <TinyPopover
            containerClassName={classnames.join(" ")}
            isOpen={show}
            position={['top', 'bottom']}
            windowBorderPadding={10}
            containerStyle={{
                overflow: "unset",
            }}
            align={align}
            onClickOutside={handleClose}
            content={({position, targetRect, popoverRect}) => (
                <ArrowContainer
                    position={position}
                    targetRect={targetRect}
                    popoverRect={popoverRect}
                    arrowColor={'white'}
                    arrowSize={10}
                >
                    <div
                        className={"h5p-order-priority-popover-container"}
                        role={"listitem"}
                    >
                        <div className={"h5p-order-priority-popover-header"}>
                            <div>
                                {header}
                            </div>
                            <button
                                onClick={handleClose}
                                className={"close-button"}
                            >
                                    <span
                                        className={"h5p-ri hri-close"}
                                        aria-hidden={true}
                                    />
                                <span className="visible-hidden">{close}</span>
                            </button>
                        </div>
                        <div
                            className={"h5p-order-priority-popover-content"}
                        >
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
    classnames: PropTypes.array,
    header: PropTypes.string,
    close: PropTypes.string,
};

export default Popover;
