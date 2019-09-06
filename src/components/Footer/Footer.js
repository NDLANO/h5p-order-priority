import React, {useContext, useState} from 'react';
import Export from '../Export/Export';
import Reset from './Reset';

function Footer() {
    return (
        <footer>
            <Reset/>
            <Export/>
        </footer>
    );
}

export default Footer;