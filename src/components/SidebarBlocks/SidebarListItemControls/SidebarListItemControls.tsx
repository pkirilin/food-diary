import React from 'react';
import './SidebarListItemControls.scss';

const SidebarListItemControls: React.FC = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className="sidebar-list-item-controls">{children}</div>;
};

export default SidebarListItemControls;
