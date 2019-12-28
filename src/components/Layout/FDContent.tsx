import React from 'react';
import './FDContent.scss';

const FDContent: React.FC = props => {
  return <section className="fd-content">{props?.children}</section>;
};

export default FDContent;
