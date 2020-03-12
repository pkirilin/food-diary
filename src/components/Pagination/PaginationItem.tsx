import React from 'react';
import './PaginationItem.scss';

interface PaginationItemProps {
  content: string | number;
  isSelected?: boolean;
  isDisabled?: boolean;
  style?: React.CSSProperties;
}

const PaginationItem: React.FC<PaginationItemProps> = ({
  content,
  isSelected = false,
  isDisabled = false,
  style = {},
}: PaginationItemProps) => {
  const classNames = ['pagination-item'];

  if (isSelected) {
    classNames.push('pagination-item_selected');
  }

  if (isDisabled) {
    classNames.push('pagination-item_disabled');
  }

  return (
    <div className={classNames.join(' ')} style={style}>
      {content}
    </div>
  );
};

export default PaginationItem;
