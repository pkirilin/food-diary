import React from 'react';
import './FDListItemLink.scss';

interface FDListItemLinkProps {
  selected?: boolean;
}

const FDListItemLink: React.FC<FDListItemLinkProps> = ({
  children,
  selected = false,
}: React.PropsWithChildren<FDListItemLinkProps>) => {
  const classNames = ['fd-list__item-link'];
  if (selected) {
    classNames.push('fd-list__item-link_selected');
  }

  return <div className={classNames.join(' ')}>{children}</div>;
};

export default FDListItemLink;
