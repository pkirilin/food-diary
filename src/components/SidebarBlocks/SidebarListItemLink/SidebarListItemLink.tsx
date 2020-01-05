import React from 'react';
import './SidebarListItemLink.scss';
import { LinkProps, Link } from 'react-router-dom';

interface SidebarListItemLinkProps extends LinkProps {
  selected?: boolean;
  children: string;
}

const SidebarListItemLink: React.FC<React.PropsWithChildren<SidebarListItemLinkProps>> = ({
  selected = false,
  children,
  ...linkProps
}: React.PropsWithChildren<SidebarListItemLinkProps>) => {
  const classNames = ['sidebar__list__item__link'];
  if (selected) {
    classNames.push('sidebar__list__item__link_selected');
  }
  return (
    <div className={classNames.join(' ')}>
      <Link {...linkProps}>{children}</Link>
    </div>
  );
};

export default SidebarListItemLink;
