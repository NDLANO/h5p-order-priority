import React from 'react';
import Export from './Export.js';
import Reset from './Reset.js';
import ShowSolutionButton from './ShowSolutionButton.js';
import './Footer.scss';

/**
 * Functional container for export, reset, and show solution logic.
 * @returns {object} JSX element.
 */
const Footer = ({ showSolution, hasSolution }) => {
  return (
    <section className={'h5p-order-priority-footer'}>
      <Reset />
      {hasSolution && <ShowSolutionButton showSolution={showSolution} />}
      <Export />
    </section>
  );
};

export default Footer;
