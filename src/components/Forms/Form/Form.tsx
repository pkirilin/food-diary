import React from 'react';
import './Form.scss';

type FormProps = {};

const Form: React.FC<FormProps> = ({ children }: React.PropsWithChildren<FormProps>) => {
  return <div className="form">{children}</div>;
};

export default Form;
