import React, {Component, Fragment} from 'react';
import {OrderPriorityContext} from "context/OrderPriorityContext";
import {escapeHTML, stripHTML} from "../utils";

export default class Export extends Component {
    static contextType = OrderPriorityContext;

    exportDocument = null;
    exportContainer = null;

    exportObject = null;

    constructor(props) {
      super(props);

      this.handleExport = this.handleExport.bind(this);
    }

    getExportObject() {
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
      } = this.context;

      const {
        resources = [],
        summary,
        userInput
      } = collectExportValues();

      return Object.assign({}, translations, {
        mainTitle: header,
        description: stripHTML(description),
        hasResources: resources.length > 0,
        summaryComment: summary || translations.labelNoSummaryComment,
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

    getExportPreview() {
      const documentExportTemplate =
            '<div class="export-preview">' +
            '<div class="page-header" role="heading" tabindex="-1">' +
            ' <h1 class="page-title">{{mainTitle}}</h1>' +
            '</div>' +
            '<div class="page-description">{{description}}</div>' +
            '<table>' +
            '<tr><th>{{headerStatement}}</th><th>{{headerComment}}</th></tr>' +
            '{{#sortedStatementList}}<tr><td>{{title}}</td><td>{{comment}}</td></tr>{{/sortedStatementList}}' +
            '</table>' +
            '{{#useSummary}}' +
            '<h2>{{labelSummaryComment}}</h2>' +
            '<p>{{summaryComment}}</p>' +
            '{{/useSummary}}' +
            '<h2>{{header}}</h2>' +
            '{{^resources}}<p>{{labelNoResources}}</p>{{/resources}}' +
            '{{#hasResources}}' +
            '<table>' +
            '<tr><th>{{headerTitle}}</th><th>{{headerIntro}}</th><th>{{headerUrl}}</th></tr>' +
            '{{#resources}}<tr><td>{{title}}</td><td>{{introduction}}</td><td>{{url}}</td></tr>{{/resources}}' +
            '</table>' +
            '{{/hasResources}}' +
            '</div>';

      return Mustache.render(documentExportTemplate, this.exportObject);
    }

    handleExport() {
      const {
        translations,
      } = this.context;

      this.exportObject = this.getExportObject();

      this.context.triggerXAPIScored(0, 0, 'completed');

      this.exportDocument = new H5P.ExportPage(
        escapeHTML(this.exportObject.mainTitle),
        this.getExportPreview(),
        H5PIntegration.reportingIsEnabled || false,
        escapeHTML(translations.submitText),
        escapeHTML(translations.submitConfirmedText),
        escapeHTML(translations.selectAll),
        escapeHTML(translations.export),
        H5P.instances[0].getLibraryFilePath('exportTemplate.docx'),
        this.exportObject
      );
      this.exportDocument.getElement().prependTo(this.exportContainer);
      H5P.$window.on('resize', () => this.exportDocument.trigger('resize'));
    }

    render() {
      const {
        translations
      } = this.context;

      return (
        <Fragment>
          <button
            className={"h5p-order-priority-button-export"}
            onClick={this.handleExport}
          >
            <span className={"h5p-ri hri-document"} aria-hidden={"true"}/>
            {translations.createDocument}
          </button>
          <div className={"export-container"} ref={el => this.exportContainer = el}/>
        </Fragment>
      );
    }
}
