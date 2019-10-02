import React from 'react';
import TinyPopover, { ArrowContainer } from 'react-tiny-popover';
import classnames from "classnames";
import PropTypes from "prop-types";

const Popover = ({handleClose, show, children, popoverContent, translations}) => {
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
                    <div
                        className={"h5p-order-priority-popover-content"}
                        role={"listitem"}
                    >
                        <div>
                            {popoverContent}
                        </div>
                        <div
                            className={classnames("h5p-order-priority-popover-close", {
                                "close-button-top": position === "top",
                                "close-button-bottom": position === "bottom",
                            })}>
                                <button
                                    onClick={handleClose}
                                    className={"close-button"}
                                >
                                    <span
                                        className={"fa fa-close"}
                                        aria-hidden={true}
                                    />
                                    <span className="visible-hidden">{translations.close}</span>
                                </button>
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
    translations: PropTypes.object,
};

export default Popover;
