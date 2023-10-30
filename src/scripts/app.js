import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from '@components/Main.js';
import { OrderPriorityProvider } from '@context/OrderPriorityContext.js';
import { breakpoints, getRatio, sanitizeParams } from '@services/utils.js';
import '@styles/_index.scss';

export default class OrderPriority extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('h5p-order-priority');

    const {
      language = 'en'
    } = extras;

    this.params = sanitizeParams(params);
    this.behaviour = this.params.behaviour || {};
    this.resetStack = [];
    this.collectExportValuesStack = [];
    this.wrapper = null;
    this.contentId = contentId;
    this.language = language;
    this.activityStartTime = new Date();
    this.activeBreakpoints = [];
    this.currentRatio = null;

    // Ensure those functions can be used by React context
    this.registerReset = this.registerReset.bind(this);
    this.collectExportValues = this.collectExportValues.bind(this);
    this.translate = this.translate.bind(this);
    this.resetTask = this.resetTask.bind(this);

    this.translations = Object.assign({}, {
      headerSummary: 'Summary',
      typeYourReasonsForSuchAnswers: 'Type your reasons for such answers',
      resources: 'Resources',
      restart: 'Restart',
      add: 'Add alternative',
      continue: 'Continue',
      cancel: 'Cancel',
      ifYouContinueAllYourChangesWillBeLost: 'All the changes will be lost. Are you sure you wish to continue?',
      submitText: 'Submit',
      submitConfirmedText: 'Saved!',
      confirm: 'Are you sure you wish to restart?',
      giveABriefSummary: 'Give a brief summary in your own words',
      documentExport: 'Document export',
      documentExportDescription: 'On this page you can choose to export your answers.',
      noStatements: 'No statements to prioritize were set!',
      createDocument: 'Create document',
      export: 'Export',
      selectAll: 'Select all',
      headerTaskDescription: 'Task description',
      headerStatement: 'Statements',
      headerComment: 'Comment',
      header: 'Resources',
      headerIntro: 'Intro',
      headerUrl: 'URL',
      labelSummaryComment: 'Summary comment',
      labelNoSummaryComment: 'No summary',
      addComment: 'Add comment',
      draggableItem: 'Draggable item',
      sourceName: 'Statements',
      destinationName: 'Prioritized',
      dragMoveInSameList: 'You have moved the item from position :startPosition to position :endPosition of :listLength',
      dragMoveInDifferentList: 'You have moved the item from list :startListName in position :startPosition of :startListLength to list :destinationListName in position :destinationPosition of :destinationListLength',
      dragCancelled: 'Movement cancelled. The item has returned to its starting position :startPosition of :listLength in :listName',
      dropInDifferentList: 'You have dropped the item. It has moved from position :startPosition in list :startListName to position :destinationPosition in list :destinationListName',
      draggableItemWasDroppedOver: 'Draggable item :itemId was dropped over droppable area :droppableId.',
      draggableItemWasDropped: 'Draggable item :itemId was dropped.',
      draggingWasCancelled: 'Dragging was cancelled. Draggable item :itemId was dropped.',
      userInfoAboutFocusMode: 'To interact with the next section some screen readers require you to be in focus mode',
      statement: 'Statement',
    }, this.params.l10n, this.params.resourceReport, this.params.accessibility);

    this.on('resize', () => {
      this.resize();
    });
  }

  /**
   * Create DOM elements.
   */
  createElements() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('h5p-order-priority-wrapper');

    createRoot(this.wrapper).render(
      <OrderPriorityProvider value={this}>
        <React.StrictMode>
          <Main
            {...this.params}
            id={this.contentId}
            language={this.language}
            collectExportValues={this.collectExportValues}
          />
        </React.StrictMode>
      </OrderPriorityProvider>
    );
  }

  /**
   * Collect export callbacks from components.
   * All components that have information that needs to be part of the export
   * registers a callback here that is run when the export is generated
   * @param {string} id Id of callback.
   * @param {function} callback Callback for export.
   * @returns {object|undefined} Export values.
   */
  collectExportValues(id, callback) {
    if (typeof id !== 'undefined') {
      this.collectExportValuesStack.push({ key: id, callback: callback });
    }
    else {
      const exportValues = {};
      this.collectExportValuesStack.forEach(({ key, callback }) => {
        exportValues[key] = callback();
      });
      return exportValues;
    }
  }

  /**
   * Register reset callback.
   * All components that have elements that can be reset register a callback
   * that is run when the user clicks on "Reset"
   * @param {function} callback Callback for reset.
   */
  registerReset(callback) {
    this.resetStack.push(callback);
  }

  /**
   * Attaches the component to a container
   * @param {H5P.jQuery} $container Container to attach content DOM to.
   */
  attach($container) {
    if (!this.wrapper) {
      this.createElements();
    }

    this.container = $container.get(0);

    // Append elements to DOM
    this.container.append(this.wrapper);
    this.container.classList.add('h5p-order-priority');
  }

  /**
   * Reset content.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  resetTask() {
    this.resetStack.forEach((callback) => {
      callback();
    });
  }

  /**
   * Set css classes based on ratio available to the container.
   * Can be replaced by container queries once adoption by browsers is better.
   * @param {HTMLElement} wrapper Wrapper.
   * @param {number} ratio Container ratio.
   */
  addBreakPoints(wrapper, ratio = getRatio(this.container)) {
    if ( ratio === this.currentRatio) {
      return;
    }

    this.activeBreakpoints = [];

    breakpoints().forEach((item) => {
      if (item.shouldAdd(ratio)) {
        wrapper.classList.add(item.className);
        this.activeBreakpoints.push(item.className);
      }
      else {
        wrapper.classList.remove(item.className);
      }
    });

    this.currentRatio = ratio;
  }

  /**
   * Resize the component.
   */
  resize() {
    if (!this.wrapper) {
      return;
    }

    this.addBreakPoints(this.wrapper);
  }

  /**
   * Translate user interface strings.
   * @param {string} key Key.
   * @param {object} vars Variables in translation template.
   * @returns {string} Translation.
   */
  translate(key, vars) {
    let translation = this.translations[key];
    if (vars !== undefined && vars !== null) {
      Object
        .keys(vars)
        .map((index) => {
          translation = translation.replace(index, vars[index]);
        });
    }
    return translation;
  }
}
