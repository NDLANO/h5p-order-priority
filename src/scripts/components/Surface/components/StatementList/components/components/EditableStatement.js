import React, { useEffect, useRef } from 'react';
import PropsTypes from 'prop-types';
import classnames from 'classnames';
import './EditableStatement.scss';

const EditableStatement = (props) => {
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
  const inputId = `input_${H5P.createUUID()}_` + id;
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
        onChange={() => props.onChanged(inputRef.current.value)}
        id={inputId}
        type={'textarea'}
        aria-label={props.translate('statement')}
      />
    </div>
  );
};

EditableStatement.propTypes = {
  statement: PropsTypes.string,
  onChanged: PropsTypes.func,
  translate: PropsTypes.func,
  idBase: PropsTypes.oneOfType([
    PropsTypes.string,
    PropsTypes.number,
  ]),
};

export default EditableStatement;
