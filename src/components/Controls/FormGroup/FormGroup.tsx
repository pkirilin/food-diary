import React from 'react';
import './FormGroup.scss';

interface FormGroupProps {
  inline?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({ children, inline = false }: React.PropsWithChildren<FormGroupProps>) => {
  const classNames = ['form-group'];
  if (inline) {
    classNames.push('form-group_inline');
  }

  return <div className={classNames.join(' ')}>{children}</div>;
};

export default FormGroup;
