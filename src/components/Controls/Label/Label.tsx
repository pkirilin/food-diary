import React from 'react';
import './Label.scss';

type LabelProps = {};

const Label: React.FC<LabelProps> = ({ children }: React.PropsWithChildren<LabelProps>) => {
  return <label className="label">{children}</label>;
};

export default Label;
