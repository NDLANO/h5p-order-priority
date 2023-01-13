import React, {useRef, useState} from 'react';
import {useOrderPriority} from "context/OrderPriorityContext";
import {escapeHTML, stripHTML} from "../../../utils";

/**
 * Display the export page to let the user summary the answers given. Uses the package H5P.ExportPage
 *
 * @return {*}
 * @constructor
 */
function Export() {

  const context = useOrderPriority();
  const {
    translate
  } = context;
  const exportContainer = useRef();
  let exportDocument;
  let exportObject;
  const [showExportPage, toggleShowExportPage] = useState(false);

  /**
   * Collect and group values displayed in the export page
   * @return {Object}
   */
  function getExportObject() {
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
        .map(statement => userInput.statements[statement])
        .filter(statement => statement.touched === true)
        .map(statement => {
          return {
            comment: statement.comment || "",
            title: statement.statement,
          };
        })
    });
  }

  /**
   * Preview of what will be exported
   * @return {*}
   */
  function getExportPreview() {
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
  }

  /**
   * Attach the package H5P.ExportPage to this content type
   */
  function handleExport() {
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
      H5P.instances[0].getLibraryFilePath('exportTemplate.docx'),
      exportObject
    );
    exportDocument.getElement().prependTo(exportContainer.current);
    exportDocument.$exportCloseButton.get(0).onclick = () => toggleShowExportPage(false);

    toggleShowExportPage(true);
    H5P.$window.on('resize', () => exportDocument.trigger('resize'));
  }

  return (
    <>
      <button
        className={"h5p-order-priority-button-export"}
        onClick={handleExport}
        type={"button"}
        aria-haspopup={"true"}
        aria-expanded={showExportPage}
      >
        <span
          className={"h5p-ri hri-document"}
        />
        {translate('createDocument')}
      </button>
      <div
        className={"export-container"}
        ref={exportContainer}
      />
    </>
  );
}

export default Export;
