import 'styles/_index.scss';
import React from 'react';
import ReactDOM from "react-dom";
import Main from "components/Main";
import {OrderPriorityProvider} from 'context/OrderPriorityContext';
import {breakpoints, getRatio, sanitizeParams} from "./components/utils";

// Load library
H5P = H5P || {};
H5P.OrderPriority = (function () {

  function Wrapper(params, contentId, extras = {}) {
    // Initialize event inheritance
    H5P.EventDispatcher.call(this);

    const {
      language = 'en'
    } = extras;

    let container;
    this.params = sanitizeParams(params);
    this.behaviour = this.params.behaviour || {};
    this.resetStack = [];
    this.collectExportValuesStack = [];
    this.wrapper = null;
    this.id = contentId;
    this.language = language;
    this.activityStartTime = new Date();
    this.activeBreakpoints = [];
    this.currentRatio = null;

    this.translations = Object.assign({}, {
      summary: "Summary",
      typeYourReasonsForSuchAnswers: "Elaborate on your decision",
      resources: "Resources",
      save: "Save",
      restart: "Restart",
      createDocument: "Create document",
      labelSummaryComment: "Summary comment",
      labelComment: "Comment",
      labelStatement: "Statement",
      labelNoComment: "No comment",
      labelResources: "Resources",
      selectAll: "Select all",
      export: "Export",
      add: "Add alternative",
      ifYouContinueAllYourChangesWillBeLost: "All the changes will be lost. Are you sure you wish to continue?",
      areYouSure: "Are you sure?",
      close: "Close",
      addComment: "Add comment",
      drag: "Drag",
      feedback: "Feedback",
      submitText: "Submit",
      submitConfirmedText: "Saved!",
      confirm: "Confirm",
      continue: "Continue",
      cancel: "Cancel",
      droparea: "Droparea :num",
      emptydroparea: "Empty droparea :index",
      draggableItem: "Draggable item: ",
      dropzone: "Dropzone :index",
      dropzoneWithValue: "Dropzone :index with value :statement",
      giveABriefSummary: "Give a brief summary in your own words",
      labelNoSummaryComment: 'No summary',
      sourceName: "Statements",
      destinationName: "Prioritized",
      dragHandleInstructions: "Press space bar to start a drag.\n  When dragging you can use the arrow keys to move the item around and escape to cancel.\n  Some screen readers may require you to be in focus mode or to use your pass through key\n",
      dragStartInstructions: "You have lifted an item in position :startPosition of :listLength in the :listName list.",
      dragMoveInSameList: "You have moved the item from position :startPosition to position :endPosition of :listLength",
      dragMoveInDifferentList: "You have moved the item from list :startListName in position :startPosition of :startListLength to list :destinationListName in position :destinationPosition of :destinationListLength",
      dragMoveNoDropTarget: "You are currently not dragging over a droppable area",
      dragCancelled: "Movement cancelled. The item has returned to its starting position :startPosition of :listLength in :listName",
      dropInSameList: "You have dropped the item. It has moved from position :startPosition to :endPosition",
      dropInDifferentList: "You have dropped the item. It has moved from position :startPosition in list :startListName to position :destinationPosition in list :destinationListName",
      dropInSameLocation: "You have dropped the item in the same position as you lifted it. The position is :startPosition in :sourceName",
      dropNoDestination: "The item has been dropped while not over a droppable location. The item has returned to its starting position of :startPosition in :listName",
      listNotification: "The next area consists of #numberOfLists #list with draggable elements.\n  Some screen readers may require you to be in focus mode or to use your pass through key to interact with them.",
      userInfoAboutFocusMode: "To interact with the next section some screen readers require you to be in focus mode",
      editableItem: "Editable item: ",
    }, this.params.l10n, this.params.resourceReport, this.params.accessibility);

    const createElements = () => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('h5p-order-priority-wrapper');
      this.wrapper = wrapper;

      ReactDOM.render(
        <OrderPriorityProvider value={this}>
          <React.StrictMode>
            <Main
              {...this.params}
              id={contentId}
              language={language}
              collectExportValues={this.collectExportValues}
            />
          </React.StrictMode>
        </OrderPriorityProvider>,
        this.wrapper
      );
    };

    /**
     * All components that has information that needs to be part of the export registers a callback
     * here that is run when the export is generated
     *
     * @param index
     * @param callback
     * @return {{}}
     */
    this.collectExportValues = (index, callback) => {
      if (typeof index !== "undefined") {
        this.collectExportValuesStack.push({key: index, callback: callback});
      }
      else {
        const exportValues = {};
        this.collectExportValuesStack.forEach(({key, callback}) => exportValues[key] = callback());
        return exportValues;
      }
    };

    /**
     * All components that have elements that can be reset registers a callback that is run
     * when the user clicks on "Reset"
     * @param callback
     * @return {number}
     */
    this.registerReset = callback => this.resetStack.push(callback);

    /**
     * Attaches the component to a container
     * @param $container
     */
    this.attach = $container => {
      if (!this.wrapper) {
        createElements();
      }

      // Append elements to DOM
      $container[0].appendChild(this.wrapper);
      $container[0].classList.add('h5p-order-priority');
      container = $container[0];
    };

    /**
     * Reset the content type
     */
    this.reset = () => {
      this.resetStack.forEach(callback => callback());
    };

    /**
     * Set css classes based on ratio available to the container
     *
     * @param wrapper
     * @param ratio
     */
    this.addBreakPoints = (wrapper, ratio = getRatio(container)) => {
      if ( ratio === this.currentRatio) {
        return;
      }
      this.activeBreakpoints = [];
      breakpoints().forEach(item => {
        if (item.shouldAdd(ratio)) {
          wrapper.classList.add(item.className);
          this.activeBreakpoints.push(item.className);
        }
        else {
          wrapper.classList.remove(item.className);
        }
      });
      this.currentRatio = ratio;
    };

    /**
     * Resize the component
     */
    this.resize = () => {
      if (!this.wrapper) {
        return;
      }
      this.addBreakPoints(this.wrapper);
    };

    /**
     * Help fetch the correct translations.
     *
     * @params key
     * @params vars
     * @return {string}
     */
    this.translate = (key, vars) => {
      let translation = this.translations[key];
      if (vars !== undefined && vars !== null) {
        Object
          .keys(vars)
          .map(index => {
            translation = translation.replace(index, vars[index]);
          });
      }
      return translation;
    };

    this.resize = this.resize.bind(this);
    this.on('resize', this.resize);
  }

  // Inherit prototype properties
  Wrapper.prototype = Object.create(H5P.EventDispatcher.prototype);
  Wrapper.prototype.constructor = Wrapper;

  return Wrapper;
})();
