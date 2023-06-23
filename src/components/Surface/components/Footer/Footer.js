import React from 'react';
import Export from './Export';
import Reset from './Reset';

/**
 * Container for the export and reset logic
 * @return {*}
 * @constructor
 */
function Footer() {
  return (
    <section className={'h5p-order-priority-footer'}>
      <Reset/>
      <Export/>
    </section>
  );
}

export default Footer;