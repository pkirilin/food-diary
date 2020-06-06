import React from 'react';
import './SectionContainer.scss';

const SectionContainer: React.FC = ({ children }: React.PropsWithChildren<unknown>) => {
  return <section className="section-container">{children}</section>;
};

export default SectionContainer;
