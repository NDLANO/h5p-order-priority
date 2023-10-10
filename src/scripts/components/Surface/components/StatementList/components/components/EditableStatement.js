import React, { useEffect, useRef } from 'react';
import PropsTypes from 'prop-types';
import classnames from 'classnames';
import { debounce } from '@services/utils.js';

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

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  const id = 'es_' + props.idBase;
  const inputId = 'input_' + id;
  return (
    <div
      className={'h5p-order-priority-editable-container'}
    >
      <input
        className={classnames('h5p-order-priority-editable')}
        ref={inputRef}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          props.onChanged(inputRef.current.value);
        }}
        onChange={debounce(() => props.onChanged(inputRef.current.value), 200)}
        id={inputId}
        type={'textarea'}
      />
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
