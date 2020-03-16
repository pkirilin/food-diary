import React from 'react';
import './PaginationItem.scss';
import { Link } from 'react-router-dom';

interface PaginationItemProps {
  content: string | number;
  linkPageNumber: number;
  isSelected?: boolean;
  isDisabled?: boolean;
  style?: React.CSSProperties;
}

const PaginationItem: React.FC<PaginationItemProps> = ({
  content,
  linkPageNumber,
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
    <li className={classNames.join(' ')} style={style}>
      <Link to={`/products?pageNumber=${linkPageNumber}`}>{content}</Link>
    </li>
  );
};

export default PaginationItem;
