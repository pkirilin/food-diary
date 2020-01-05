import React from 'react';
import './MainContainer.scss';

interface MainContainerProps {
  withSidebar?: boolean;
}

const MainContainer: React.FC<React.PropsWithChildren<MainContainerProps>> = ({
  children,
  withSidebar,
}: React.PropsWithChildren<MainContainerProps>) => {
  const cssClasses = ['main-container'];
  if (withSidebar) {
    cssClasses.push('main-container_sidebar');
  }
  return <main className={cssClasses.join(' ')}>{children}</main>;
};

export default MainContainer;
