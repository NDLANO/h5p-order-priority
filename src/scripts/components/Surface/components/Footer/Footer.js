import React from 'react';
import Export from './Export.js';
import Reset from './Reset.js';

/**
 * Functional container for export and reset logic.
 * @returns {object} JSX element.
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
