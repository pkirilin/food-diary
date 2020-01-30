import React from 'react';
import './SectionContainer.scss';

interface SectionContainerProps {
  loading?: boolean;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  loading = false,
}: React.PropsWithChildren<SectionContainerProps>) => {
  const classNames = ['section-container'];
  if (loading) {
    classNames.push('section-container_loading');
  }
  return <section className={classNames.join(' ')}>{children}</section>;
};

export default SectionContainer;
