import React from 'react';
import './Label.scss';

const Label: React.FC = ({ children }: React.PropsWithChildren<unknown>) => {
  return <label className="label">{children}</label>;
};

export default Label;
