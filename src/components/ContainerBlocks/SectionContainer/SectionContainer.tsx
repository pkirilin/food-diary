import React from 'react';
import './SectionContainer.scss';

type SectionContainerProps = {};

const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
}: React.PropsWithChildren<SectionContainerProps>) => {
  return <section className="section-container">{children}</section>;
};

export default SectionContainer;
