import React from 'react';
import Export from './Export.js';
import Reset from './Reset.js';

/**
 * Container for the export and reset logic
 * @return {*}
 * @constructor
 */
const Footer = () => {
  return (
    <section className={'h5p-order-priority-footer'}>
      <Reset/>
      <Export/>
    </section>
  );
};

export default Footer;
