import React from 'react';
import './FDListItem.scss';

interface FDListItemProps {
  selected?: boolean;
}

const FDListItem: React.FC<FDListItemProps> = ({
  children,
  selected = false,
}: React.PropsWithChildren<FDListItemProps>) => {
  const classNames = ['fd-list__item'];
  if (selected) {
    classNames.push('fd-list__item_selected');
  }

  return <div className={classNames.join(' ')}>{children}</div>;
};

export default FDListItem;
