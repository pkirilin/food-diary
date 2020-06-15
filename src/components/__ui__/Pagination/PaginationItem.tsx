import React from 'react';
import './PaginationItem.scss';

interface PaginationItemProps {
  content: string | number;
  linkPageNumber: number;
  isSelected?: boolean;
  isDisabled?: boolean;
  style?: React.CSSProperties;
  onPageNumberUpdate?: (newPageNumber?: number) => void;
}

const PaginationItem: React.FC<PaginationItemProps> = ({
  content,
  linkPageNumber,
  isSelected = false,
  isDisabled = false,
  style = {},
  onPageNumberUpdate,
}: PaginationItemProps) => {
  const classNames = ['pagination-item'];

  if (isSelected) {
    classNames.push('pagination-item_selected');
  }

  if (isDisabled) {
    classNames.push('pagination-item_disabled');
  }

  const handlePaginationItemClick = (): void => {
    if (onPageNumberUpdate) {
      onPageNumberUpdate(linkPageNumber);
    }
  };

  return (
    <li className={classNames.join(' ')} style={style} onClick={handlePaginationItemClick}>
      {content}
    </li>
  );
};

export default PaginationItem;
