import React from 'react';
import './SidebarListItem.scss';

interface SidebarListItemProps {
  selected?: boolean;
  editable?: boolean;
}

const SidebarListItem: React.FC<SidebarListItemProps> = ({
  children,
  selected = false,
  editable = false,
}: React.PropsWithChildren<SidebarListItemProps>) => {
  const classNames = ['sidebar-list-item'];
  if (selected) {
    classNames.push('sidebar-list-item_selected');
  }
  if (editable) {
    classNames.push('sidebar-list-item_editable');
  }
  return <div className={classNames.join(' ')}>{children}</div>;
};

export default SidebarListItem;
