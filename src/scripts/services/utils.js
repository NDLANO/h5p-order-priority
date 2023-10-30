import { escape, decode } from 'he';

/**
 * CSS classnames and breakpoints for the content type
 * @type {{largeTablet: string, large: string, mediumTablet: string}}
 */
const OrderPriorityClassnames = {
  'mediumTablet': 'h5p-medium-tablet-size',
  'largeTablet': 'h5p-large-tablet-size',
  'large': 'h5p-large-size',
};

/**
 * Statement Data Object.
 * @class
 * @param {object} initValues Initial values.
 * @returns {StatementDataObject} Sanitized values.
 */
export class StatementDataObject {
  constructor(initValues) {
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
}

/**
 * Decode HTML.
 * @param {string} html HTML text.
 * @returns {string} Text decoded from HTML.
 */
export const decodeHTML = (html) => {
  return html ? decode(html) : html;
};

/**
 * Escape HTML
 * @param {string} html HTML text.
 * @returns {string} Text with escaped HTML.
 */
export const escapeHTML = (html) => {
  return html ? escape(html) : html;
};

/**
 * Strip HTML from text.
 * @param {string} html HTML text.
 * @returns {string} Text without HTML tags.
 */
export const stripHTML = (html) => {
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.innerText;
};

/**
 * Purify HTML: Decode and remove.
 * @param {string} html HTML text.
 * @returns {string} Text without HTML tags.
 */
export const purifyHTML = (html) => {
  return stripHTML(decodeHTML(html));
};

/**
 * Get list of classname and conditions for when to add the classname to the content type
 * @returns {object[]} Classnames and function to determine whether to be set.
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
 * Get ratio of container.
 * @param {HTMLElement} container Container element.
 * @returns {number|undefined} Container's ratio.
 */
export const getRatio = (container) => {
  if (!container) {
    return;
  }

  const computedStyles = window.getComputedStyle(container);

  return container.offsetWidth /
    parseFloat(computedStyles.getPropertyValue('font-size'));
};

/**
 * Get DnD id.
 * @param {object} element Element.
 * @returns {string} DnD id.
 */
export const getDnDId = (element) => {
  return [element.prefix, element.id].join('-');
};

/**
 * Sanitize author parameters.
 * @param {object} params Parameters.
 * @returns {object} Sanitized parameters.
 */
export const sanitizeParams = (params) => {
  const filterResourceList = (element) => {
    return Object.keys(element).length && typeof element === 'object';
  };

  const handleObject = (sourceObject) => {
    if (
      sourceObject === undefined ||
      sourceObject === null ||
      !filterResourceList(sourceObject)
    ) {
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

  resources.params.resourceList = (resources.params?.resourceList ?? [])
    .filter((resourceItem) => Object.keys(resourceItem).length > 0);

  if (resources.params?.resourceList?.length) {
    resources.params = {
      ...resources.params,
      l10n: handleObject(resources.params.l10n),
      resourceList: resources.params.resourceList
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
};
