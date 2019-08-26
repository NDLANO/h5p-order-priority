import React from 'react';
import { OrderPriorityContext } from "../../context/OrderPriorityContext";
import Export from "../Export/Export";

function Footer() {
    return (
        <OrderPriorityContext.Consumer>
            {({behaviour, reset, translations}) => (
                <footer>
                    {behaviour.enableRetry === true && (
                        <button
                            className={"h5p-order-priority-button-restart"}
                            onClick={reset}
                        >
                            <i className={"fa fa-refresh"} />
                            {translations.restart}
                        </button>
                    )}
                    <Export/>
                </footer>
            )}
        </OrderPriorityContext.Consumer>
    );
}

export default Footer;