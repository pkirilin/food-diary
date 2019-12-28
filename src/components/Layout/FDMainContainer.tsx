import React, { ReactNode } from 'react';
import './FDMainContainer.scss';

interface FDMainContainerProps {
  children?: ReactNode;
  withSidebar?: boolean;
}

const FDMainContainer: React.FC<FDMainContainerProps> = ({ children, withSidebar }: FDMainContainerProps) => {
  const cssClasses: string[] = ['fd-main-container'];
  if (withSidebar) {
    cssClasses.push('fd-main-container-sidebar');
  }
  return <main className={cssClasses.join(' ')}>{children}</main>;
};

export default FDMainContainer;
