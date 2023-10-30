import React, { useRef, useState } from 'react';
import { useOrderPriority } from '@context/OrderPriorityContext.js';
import { escapeHTML, purifyHTML } from '@services/utils.js';
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

  const [showExportPage, toggleShowExportPage] = useState(false);

  const getInputFields = () => {
    const fields = [];

    const params = context.params;
    const exportValues = context.collectExportValues();

    // Instructions
    const instructions = [];
    if (params.description) {
      instructions.push({
        description: translate('headerTaskDescription'),
        value: purifyHTML(params.description).replace(/\n\n/g, '\n')
      });
    }

    instructions.push({
      description:
        purifyHTML(params.summaryHeader) || translate('headerSummary'),
      value: purifyHTML(params.summaryInstruction).replace(/\n\n/g, '\n')
    });

    instructions.push({
      description: translate('labelSummaryComment'),
      value: purifyHTML(exportValues.summary) || translate('labelNoSummaryComment')
    });

    fields.push({
      title: translate('headerIntro'),
      inputArray: instructions
    });

    // Resources
    if (exportValues.resources?.length) {
      const resources = exportValues.resources.map((resource) => {
        const url = resource.url ?
          `${translate('headerUrl')}: ${purifyHTML(resource.url)}` :
          undefined;

        return {
          description: purifyHTML(resource.title),
          value: [purifyHTML(resource.introduction), purifyHTML(url)]
            .filter((entry) => !!entry)
            .join('\n')
        };
      });

      if (resources.length) {
        fields.push({
          title: translate('header'),
          inputArray: resources
        });
      }
    }

    // Statements
    if (exportValues.userInput.prioritizedStatements.length) {
      const statements = exportValues.userInput.prioritizedStatements
        .map((statement, index) => {
          const value = statement.comment.length ?
            `${translate('headerComment')}: ${purifyHTML(statement.comment)}` :
            '';

          return {
            description: `${index + 1} ${purifyHTML(statement.statement)}`,
            value: value
          };
        });

      if (statements.length) {
        fields.push({
          title: translate('headerStatement'),
          inputArray: statements
        });
      }
    }

    return fields;
  };

  /**
   * Attach package H5P.ExportPage to this content type.
   */
  const handleExport = () => {
    const {
      translate,
    } = context;

    const inputFields = getInputFields();

    context.triggerXAPIScored(0, 0, 'completed');

    const exportDocument = new H5P.DocumentExportPage.CreateDocument(
      {
        title: escapeHTML(translate('documentExport')),
        a11yFriendlyTitle: escapeHTML(translate('documentExport')),
        description: escapeHTML(translate('documentExportDescription')),
        createDocumentLabel: escapeHTML(translate('continue')),
        exportTextLabel: escapeHTML(translate('export')),
        submitTextLabel: escapeHTML(translate('submitText')),
        submitSuccessTextLabel: escapeHTML(translate('submitConfirmedText')),
        selectAllTextLabel: escapeHTML(translate('selectAll')),
      },
      purifyHTML(context.params.header) || '',
      H5PIntegration.reportingIsEnabled || false,
      inputFields,
      { inputArray: [] }
    );

    exportDocument.attach(exportContainer.current);

    const closeButton = exportContainer.current.querySelector('.joubel-export-page-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        toggleShowExportPage(false);
      });
    }

    toggleShowExportPage(true);

    context.on('resize', () => exportDocument.trigger('resize'));
  };

  return (
    <>
      <button
        className={'h5p-order-priority-footer-button h5p-order-priority-button-export'}
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
