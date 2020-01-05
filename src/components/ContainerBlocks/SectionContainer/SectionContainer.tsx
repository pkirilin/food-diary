import React from 'react';
import './SectionContainer.scss';

const SectionContainer: React.FC = props => {
  return <section className="section-container">{props?.children}</section>;
};

export default SectionContainer;
