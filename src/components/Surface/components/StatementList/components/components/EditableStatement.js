import React, { useEffect, useRef } from 'react';
import PropsTypes from 'prop-types';
import classnames from 'classnames';
import { debounce } from 'components/utils';

function EditableStatement(props) {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.value = props.statement;
  }, [props.statement]);

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      props.onChanged(inputRef.current.value);
    }
  };

  const handleBlur = () => {
    toggleEditMode(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  const id = "es_" + props.idBase;
  const inputId = "input_" + id;
  return (
    <div
      className={'h5p-order-priority-editable-container'}
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
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

EditableStatement.propTypes = {
  statement: PropsTypes.string,
  onChanged: PropsTypes.func,
  idBase: PropsTypes.oneOfType([
    PropsTypes.string,
    PropsTypes.number,
  ]),
};

export default EditableStatement;
