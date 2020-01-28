import React, {useState, useRef} from 'react';
import PropsTypes from 'prop-types';
import classnames from 'classnames';
import {debounce} from "../../utils";

function EditableStatement(props) {

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
  const labelId = "label_" + id;
  const inputId = "input_" + id;
  return (
    <div
      role={"textbox"}
      tabIndex={0}
      onClick={handleClick}
      className={"h5p-order-priority-editable-container"}
      onKeyUp={handleKeyUp}
      aria-labelledby={labelId}
    >
      <div>
        <label
          title={props.statement}
          htmlFor={inputId}
          id={labelId}
        >
          <span className={"visible-hidden"}>Statement</span>
          <input
            className={classnames("h5p-order-priority-editable", {
              "hidden": inEditMode === false,
            })}
            ref={inputRef}
            onBlur={handleBlur}
            onChange={debounce(() => props.onBlur(inputRef.current.value), 200)}
            aria-label={"Edit statement " + props.statement}
            aria-hidden={!inEditMode}
            id={inputId}
          />
        </label>
        <p
          aria-hidden={inEditMode}
          className={classnames("h5p-order-priority-noneditable", {
            "hidden": inEditMode === true,
          })}
        >
          {props.statement}
        </p>
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