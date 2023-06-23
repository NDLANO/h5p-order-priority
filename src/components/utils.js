import { escape, decode } from 'he';

/**
 * CSS classnames and breakpoints for the content type
 *
 * @type {{largeTablet: string, large: string, mediumTablet: string}}
 */
const OrderPriorityClassnames = {
  'mediumTablet': 'h5p-medium-tablet-size',
  'largeTablet': 'h5p-large-tablet-size',
  'large': 'h5p-large-size',
};

/**
 *
 * @param initValues
 * @return {StatementDataObject}
 * @constructor
 */
export function StatementDataObject(initValues) {
  this.id = null;
  this.comment = null;
  this.displayIndex = null;
  this.added = false;
  this.statement = null;
  this.isPlaceholder = false;
  this.isUserAdded = false;
  this.editMode = false;
  this.touched = false;
  return Object.assign(this, initValues);
}

/**
 * Debounce function that
 *
 * @param func
 * @param wait
 * @param immediate
 * @return {function(...[*]=)}
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function decodeHTML(html) {
  return html ? decode(html) : html;
}

/**
 * Excapes html in string
 * @param html
 * @return {*}
 */
export function escapeHTML(html) {
  return html ? escape(html) : html;
}

export function stripHTML(html) {
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.innerText;
}

/**
 * Get list of classname and conditions for when to add the classname to the content type
 *
 * @return {[{className: string, shouldAdd: (function(*): boolean)}, {className: string, shouldAdd: (function(*): boolean|boolean)}, {className: string, shouldAdd: (function(*): boolean)}]}
 */
export const breakpoints = () => {
  return [
    {
      'className': OrderPriorityClassnames.mediumTablet,
      'shouldAdd': (ratio) => ratio >= 22 && ratio < 40,
    },
    {
      'className': OrderPriorityClassnames.largeTablet,
      'shouldAdd': (ratio) => ratio >= 40 && ratio < 60,
    },
    {
      'className': OrderPriorityClassnames.large,
      'shouldAdd': (ratio) => ratio >= 60,
    },
  ];
};

/**
 * Get the ratio of the container
 *
 * @return {number}
 */
export function getRatio(container) {
  if ( !container) {
    return;
  }
  const computedStyles = window.getComputedStyle(container);
  return container.offsetWidth / parseFloat(computedStyles.getPropertyValue('font-size'));
}


/**
 * @param {CategoryDataObject | ArgumentDataObject} element
 * @returns {string}
 */
export function getDnDId(element) {
  return [element.prefix, element.id].join('-');
}

/**
 * Function to make sure the parameters sent into the content type to be valid
 * @param params
 * @return {{summaryHeader: *, l10n: {}, resourceReport: {}, accessibility: {}, summaryInstruction: *, resources: *, header: *, description: *, statementsList: *}}
 */
export function sanitizeParams(params) {
  const filterResourceList = (element) => Object.keys(element).length !== 0 && element.constructor === Object;
  const handleObject = (sourceObject) => {
    if (sourceObject === undefined || sourceObject === null || !filterResourceList(sourceObject)) {
      return sourceObject;
    }
    return Object.keys(sourceObject).reduce((aggregated, current) => {
      aggregated[current] = decodeHTML(sourceObject[current]);
      return aggregated;
    }, {});
  };

  let {
    accessibility,
    header,
    description,
    l10n,
    resourceReport,
    resources,
    statementsList,
    summaryHeader,
    summaryInstruction,
  } = params;

  if (Array.isArray(statementsList)) {
    statementsList = statementsList.map((statement) => decodeHTML(statement));
  }

  if (resources.params.resourceList && resources.params.resourceList.filter(filterResourceList).length > 0) {
    resources.params = {
      ...resources.params,
      l10n: handleObject(resources.params.l10n),
      resourceList: resources.params.resourceList.filter(filterResourceList).map((resource) => {
        const {
          title,
          introduction,
        } = resource;
        return {
          ...resource,
          title: decodeHTML(title),
          introduction: decodeHTML(introduction),
        };
      }),
    };
  }

  return {
    ...params,
    statementsList,
    resources,
    header: decodeHTML(header),
    description: decodeHTML(description),
    summaryHeader: decodeHTML(summaryHeader),
    summaryInstruction: decodeHTML(summaryInstruction),
    l10n: handleObject(l10n),
    resourceReport: handleObject(resourceReport),
    accessibility: handleObject(accessibility),
  };
}
