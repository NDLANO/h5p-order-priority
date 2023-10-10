import React, { useEffect, useRef } from 'react';
import ReactHtmlParser from 'html-react-parser';
import PropTypes from 'prop-types';
import Surface from '@components/Surface/Surface.js';
import Footer from '@components/Surface/components/Footer/Footer.js';
import '@assets/fonts/H5PReflectionFont.scss';

function Main(props) {

  const resourceContainer = useRef();

  const {
    id,
    language = 'en',
    collectExportValues,
    header,
    description = '',
    resources: resourcesList,
  } = props;

  useEffect(() => {
    const filterResourceList = (element) => Object.keys(element).length !== 0 && element.constructor === Object;
    if ( resourcesList.params.resourceList && resourcesList.params.resourceList.filter(filterResourceList).length > 0) {
      const resourceList = new H5P.ResourceList(resourcesList.params, id, language);
      resourceList.attach(resourceContainer.current);

      collectExportValues('resources', () => resourcesList.params.resourceList
        .filter(filterResourceList)
        .map((resource) => Object.assign({}, {
          title: '',
          url: '',
          introduction: '',
        }, resource)) || []);
    }
  }, [resourcesList]);

  return (
    <article>
      <div
        className={'h5p-order-priority-header'}
      >{header}</div>
      <div
        className={'h5p-order-priority-surface'}
      >
        <div
          className={'h5p-order-priority-surface-info'}
          ref={resourceContainer}
        >
          {description && (
            <div className={'h5p-order-priority-description'}>{ReactHtmlParser(description)}</div>
          )}
        </div>
        <Surface />
      </div>
      <Footer/>
    </article>
  );
}

Main.propTypes = {
  id: PropTypes.number,
  language: PropTypes.string,
  header: PropTypes.string,
  description: PropTypes.string,
  collectExportValues: PropTypes.func,
  resources: PropTypes.object,
};

export default Main;
