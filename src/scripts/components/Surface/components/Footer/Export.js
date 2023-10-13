import React, { useRef, useState } from 'react';
import { useOrderPriority } from '@context/OrderPriorityContext.js';
import { escapeHTML, stripHTML } from '@services/utils.js';
import './Export.scss';

/**
 * Display export page to let user summarize the answers given.
 * Uses the package H5P.ExportPage.
 * @returns {object} JSX Element.
 */
const Export = () => {
  const context = useOrderPriority();
  const {
    translate
  } = context;
  const exportContainer = useRef();
  let exportDocument;
  let exportObject;
  const [showExportPage, toggleShowExportPage] = useState(false);

  /**
   * Collect and group values displayed in export page.
   * @returns {object} Values displayed in export page.
   */
  const getExportObject = () => {
    const {
      params: {
        header,
        description = '',
      },
      behaviour: {
        provideSummary = true,
      },
      translations,
      collectExportValues,
    } = context;

    const {
      resources = [],
      summary,
      userInput
    } = collectExportValues();

    return Object.assign({}, translations, {
      mainTitle: header,
      description: stripHTML(description),
      hasResources: resources.length > 0,
      hasSummaryComment: summary && summary.length !== 0,
      summaryComment: summary,
      useSummary: provideSummary,
      resources: resources,
      sortedStatementList: userInput.prioritizedStatements
        .map((statement) => userInput.statements[statement])
        .filter((statement) => statement.touched === true)
        .map((statement) => {
          return {
            comment: statement.comment || '',
            title: statement.statement,
          };
        })
    });
  };

  /**
   * Create preview of what will be exported.
   * @returns {object} Mustache render output.
   */
  const getExportPreview = () => {
    const documentExportTemplate =
            '<div class="export-preview">' +
            '<div class="page-header" role="heading" tabindex="-1">' +
            ' <div class="page-title h1">{{mainTitle}}</div>' +
            '</div>' +
            '<div class="page-description">{{description}}</div>' +
            '<table>' +
            '<tr><th>{{headerStatement}}</th><th>{{headerComment}}</th></tr>' +
            '{{#sortedStatementList}}<tr><td>{{title}}</td><td>{{comment}}</td></tr>{{/sortedStatementList}}' +
            '</table>' +
            '{{#useSummary}}' +
            '{{#hasSummaryComment}}' +
            '<div class="h2">{{labelSummaryComment}}</div>' +
            '<p>{{summaryComment}}</p>' +
            '{{/hasSummaryComment}}' +
            '{{/useSummary}}' +
            '{{#hasResources}}' +
            '<div class="h2">{{header}}</div>' +
            '<table>' +
            '<tr><th>{{headerTitle}}</th><th>{{headerIntro}}</th><th>{{headerUrl}}</th></tr>' +
            '{{#resources}}<tr><td>{{title}}</td><td>{{introduction}}</td><td>{{url}}</td></tr>{{/resources}}' +
            '</table>' +
            '{{/hasResources}}' +
            '</div>';

    return Mustache.render(documentExportTemplate, exportObject);
  };

  /**
   * Attach package H5P.ExportPage to this content type.
   */
  const handleExport = () => {
    const {
      translate,
    } = context;

    exportObject = getExportObject();

    context.triggerXAPIScored(0, 0, 'completed');

    exportDocument = new H5P.ExportPage(
      escapeHTML(exportObject.mainTitle),
      getExportPreview(),
      H5PIntegration.reportingIsEnabled || false,
      escapeHTML(translate('submitText')),
      escapeHTML(translate('submitConfirmedText')),
      escapeHTML(translate('selectAll')),
      escapeHTML(translate('export')),
      context.getLibraryFilePath('exportTemplate.docx'),
      exportObject
    );
    exportDocument.getElement().prependTo(exportContainer.current);
    exportDocument.$exportCloseButton.get(0).onclick = () => toggleShowExportPage(false);

    toggleShowExportPage(true);
    H5P.$window.on('resize', () => exportDocument.trigger('resize'));
  };

  return (
    <>
      <button
        className={'h5p-order-priority-button-export'}
        onClick={handleExport}
        type={'button'}
        aria-haspopup={'true'}
        aria-expanded={showExportPage}
      >
        <span
          className={'h5p-ri hri-document'}
        />
        {translate('createDocument')}
      </button>
      <div
        className={'export-container'}
        ref={exportContainer}
      />
    </>
  );
};

export default Export;
