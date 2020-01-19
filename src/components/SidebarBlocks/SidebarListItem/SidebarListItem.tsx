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
  const classNames = ['sidebar__list__item'];
  if (selected) {
    classNames.push('sidebar__list__item_selected');
  }
  if (editable) {
    classNames.push('sidebar__list__item_editable');
  }
  return <div className={classNames.join(' ')}>{children}</div>;
};

export default SidebarListItem;
