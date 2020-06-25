import React from 'react';
import './SidebarListItemLink.scss';
import { NavLink, NavLinkProps } from 'react-router-dom';

interface SidebarListItemLinkProps extends NavLinkProps {
  selected?: boolean;
  isNarrow?: boolean;
}

const SidebarListItemLink: React.FC<SidebarListItemLinkProps> = ({
  selected = false,
  isNarrow = false,
  children,
  ...linkProps
}: React.PropsWithChildren<SidebarListItemLinkProps>) => {
  const classNames = ['sidebar-list-item-link'];

  if (selected) classNames.push('sidebar-list-item-link_selected');

  if (isNarrow) classNames.push('sidebar-list-item-link_narrow');

  return (
    <NavLink {...linkProps} className={classNames.join(' ')}>
      {children}
    </NavLink>
  );
};

export default SidebarListItemLink;
