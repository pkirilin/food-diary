import React from 'react';
import './Form.scss';

const Form: React.FC = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className="form">{children}</div>;
};

export default Form;
