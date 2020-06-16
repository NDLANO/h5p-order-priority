import React, {useState, useRef} from 'react';
import PropsTypes from 'prop-types';
import classnames from 'classnames';
import {debounce} from "components/utils";
import {useOrderPriority} from "context/OrderPriorityContext";

function EditableStatement(props) {

  const context = useOrderPriority();

  const [inEditMode, toggleEditMode] = useState(props.inEditMode);

  const inputRef = useRef();

  const handleClick = () => {
    if (inEditMode === false) {
      toggleEditMode(true);
      inputRef.current.value = props.statement;
      setTimeout(() => inputRef.current.focus(), 0);
    }
  };

  const handleKeyUp = event => {
    if (event.keyCode === 13) {
      if ( inEditMode ) {
        handleBlur();
      }
      else {
        handleClick();
      }
    }
  };

  const handleBlur = () => {
    toggleEditMode(false);
  };

  const id = "es_" + props.idBase;
  const inputId = "input_" + id;
  return (
    <div
      className={"h5p-order-priority-editable-container"}
    >
      <div>
        <label
          htmlFor={inputId}
          tabIndex={0}
          onClick={handleClick}
          onKeyUp={handleKeyUp}
          className={classnames("h5p-order-priority-noneditable", {
            "hidden": inEditMode === true,
          })}
          aria-label={context.translations.editableItem + props.statement}
        >
          {props.statement}
        </label>
        <input
          className={classnames("h5p-order-priority-editable", {
            "hidden": inEditMode === false,
          })}
          ref={inputRef}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          onChange={debounce(() => props.onBlur(inputRef.current.value), 200)}
          id={inputId}
          type={"textarea"}
        />
      </div>
    </div>
  );
}

EditableStatement.propTypes = {
  statement: PropsTypes.string,
  inEditMode: PropsTypes.bool,
  onBlur: PropsTypes.func,
  idBase: PropsTypes.oneOfType([
    PropsTypes.string,
    PropsTypes.number,
  ]),
};

EditableStatement.defaultProps = {
  inEditMode: false,
};

export default EditableStatement;