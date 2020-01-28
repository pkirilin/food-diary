import React from 'react';
import './SidebarListPlaceholder.scss';

type SidebarListPlaceholderType = 'primary' | 'info';

interface SidebarListPlaceholderProps {
  type?: SidebarListPlaceholderType;
}

const SidebarListPlaceholder: React.FC<SidebarListPlaceholderProps> = ({
  children,
  type = 'primary',
}: React.PropsWithChildren<SidebarListPlaceholderProps>) => {
  const classNames = ['sidebar-list-placeholder', `sidebar-list-placeholder_${type}`];
  return <div className={classNames.join(' ')}>{children}</div>;
};

export default SidebarListPlaceholder;
