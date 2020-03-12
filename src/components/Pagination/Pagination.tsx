import React, { useState, useEffect } from 'react';
import './Pagination.scss';
import PaginationItem from './PaginationItem';

interface PaginationProps {
  pagesCount: number;
  selectedPageNumber?: number;
}

// TODO: move to utils
const createRange = (rangeLength: number): number[] => {
  const res: number[] = [];
  for (let i = 1; i <= rangeLength; i++) {
    res.push(i);
  }
  return res;
};

const Pagination: React.FC<PaginationProps> = ({ pagesCount, selectedPageNumber }: PaginationProps) => {
  const [paginationItems, setPaginationItems] = useState<number[]>([]);

  useEffect(() => {
    const itemsRange = createRange(pagesCount);
    setPaginationItems(itemsRange);
  }, [pagesCount, setPaginationItems]);

  const pagerItemsStyle: React.CSSProperties = {
    minWidth: 50,
  };

  return (
    <div className="pagination">
      <PaginationItem content="First" style={pagerItemsStyle} isDisabled={true}></PaginationItem>
      <PaginationItem content="Prev" style={pagerItemsStyle}></PaginationItem>
      {paginationItems.map((pageNumber, index) => {
        const isSelected = pageNumber === selectedPageNumber;
        return <PaginationItem key={index} content={pageNumber} isSelected={isSelected}></PaginationItem>;
      })}
      <PaginationItem content="Next" style={pagerItemsStyle}></PaginationItem>
      <PaginationItem content="Last" style={pagerItemsStyle}></PaginationItem>
    </div>
  );
};

export default Pagination;
