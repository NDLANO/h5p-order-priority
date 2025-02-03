import React, { useEffect, useRef, useState } from 'react';
import ReactHtmlParser from 'html-react-parser';
import PropTypes from 'prop-types';
import Surface from '@components/Surface/Surface.js';
import Footer from '@components/Surface/components/Footer/Footer.js';
import '@assets/fonts/H5PReflectionFont.scss';
import SolutionDisplay from '@components/Surface/components/SolutionDisplay.js';
import './Main.scss';

const Main = (props) => {
  const resourceContainer = useRef();
  const [solution, setSolution] = useState(null);
  const [isFooterVisible, setIsFooterVisible] = useState(true); // State to control footer visibility

  const {
    id,
    language = 'en',
    collectExportValues,
    header,
    description = '',
    resources: resourcesList,
    showSolution,
  } = props;

  const effectCalled = useRef(false);

  // Check if solution is available
  const hasSolution = props.solution.sample && props.solution.introduction &&
    !props.solution.sample.includes('<div>&nbsp;</div>') ||
    !props.solution.introduction.includes('<div>&nbsp;</div>');

  // componentDidMount pseudo equivalent
  useEffect(() => {
    if (effectCalled.current) {
      return; // Guard to work around strict mode
    }

    effectCalled.current = true;

    if (!resourcesList.params.resourceList.length) {
      return; // Nothing to do
    }

    if (resourceContainer.current.querySelector('.h5p-resource-list-wrapper')) {
      return; // Guard for React.StrictMode in development to not attach twice
    }

    const resourceList = new H5P.ResourceList(
      resourcesList.params, id, language
    );
    resourceList.attach(resourceContainer.current);

    const callback = () => {
      return resourcesList.params.resourceList;
    };

    collectExportValues('resources', callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShowSolution = () => {
    const solutionData = showSolution();
    if (solutionData) {
      setSolution(solutionData);

      // Disable all input elements
      const inputs = document.querySelectorAll('input, select, textarea, button');
      inputs.forEach((input) => {
        input.disabled = true;
      });

      // Hide the footer
      setIsFooterVisible(false);
    }
    else {
      console.warn('No solution available.');
    }
  };

  return (
    <article className={'h5p-order-priority-article'}>
      <div
        className={'h5p-order-priority-header'}
      >{header}</div>
      <div
        className={'h5p-order-priority-surface-main'}
      >
        <div
          className={'h5p-order-priority-surface-info'}
          ref={resourceContainer}
        >
          {description && (
            <div className={'h5p-order-priority-description'}>
              {ReactHtmlParser(description)}
            </div>
          )}
        </div>
        <Surface />
      </div>
      {solution && <SolutionDisplay solution={solution} />}
      {isFooterVisible && <Footer showSolution={handleShowSolution} hasSolution={hasSolution} />} {/* Conditionally render the Footer */}
    </article>
  );
};

Main.propTypes = {
  id: PropTypes.number,
  language: PropTypes.string,
  header: PropTypes.string,
  description: PropTypes.string,
  collectExportValues: PropTypes.func,
  resources: PropTypes.object,
  showSolution: PropTypes.func,
  translations: PropTypes.object,
  solution: PropTypes.object, // Add this prop
};

export default Main;
