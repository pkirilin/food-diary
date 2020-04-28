import React from 'react';
import './SectionPlaceholder.scss';

const SectionPlaceholder: React.FC = props => {
  return <div className="section-placeholder">{props?.children}</div>;
};

export default SectionPlaceholder;
