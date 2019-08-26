import './OrderPriority.scss';
import React, {Fragment} from 'react';
import Header from './Header/Header';
import Surface from './Surface/Surface';
import Summary from "./Summary/Summary";
import Footer from "./Footer/Footer";

function Main() {
    return (
        <Fragment>
            <Header />
            <Surface />
            <Summary/>
            <Footer/>
        </Fragment>
    );
}

export default Main;
