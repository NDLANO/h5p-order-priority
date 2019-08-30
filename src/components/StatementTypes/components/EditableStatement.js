import React, {useState} from 'react';
import PropsTypes from 'prop-types';

export default function EditableStatement(props) {

    const [statement, setStatement] = useState(props.statement);

    return (
        <div>
            {statement}
        </div>
    );
}

EditableStatement.propTypes = {
    statement: PropsTypes.string,
};