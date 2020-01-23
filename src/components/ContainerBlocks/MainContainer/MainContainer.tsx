import React from 'react';
import './MainContainer.scss';

interface MainContainerProps {
  withSidebar?: boolean;
}

const MainContainer: React.FC<React.PropsWithChildren<MainContainerProps>> = ({
  children,
  withSidebar,
}: React.PropsWithChildren<MainContainerProps>) => {
  const classNames = ['main-container'];
  if (withSidebar) {
    classNames.push('main-container_sidebar');
  }
  return <main className={classNames.join(' ')}>{children}</main>;
};

export default MainContainer;
