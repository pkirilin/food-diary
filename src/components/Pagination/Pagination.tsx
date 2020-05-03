import React, { useState, useEffect } from 'react';
import './Pagination.scss';
import PaginationItem from './PaginationItem';
import updatePageRanges from './pageRangesUpdater';
import createNumericRange from './range';

interface PaginationProps {
  totalPagesCount: number;
  maxVisiblePagesCount?: number;
  isDisabled?: boolean;
  marginTop?: string | number;
  currentPageNumber?: number;
  onPageNumberUpdate?: (newPageNumber?: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPagesCount,
  currentPageNumber,
  maxVisiblePagesCount = 10,
  isDisabled = false,
  marginTop = 0,
  onPageNumberUpdate,
}: PaginationProps) => {
  const [visiblePageRanges, setVisiblePageRanges] = useState<[number, number]>();

  useEffect(() => {
    const newPageNumber = currentPageNumber ? currentPageNumber : 1;
    const newPageRanges = updatePageRanges(newPageNumber, totalPagesCount, maxVisiblePagesCount);
    setVisiblePageRanges(newPageRanges);
  }, [currentPageNumber, totalPagesCount, maxVisiblePagesCount]);

  const paginationItems = visiblePageRanges ? createNumericRange(visiblePageRanges[0], visiblePageRanges[1]) : [];

  const paginationStyle: React.CSSProperties = {
    marginTop,
  };

  const paginationItemsStyle: React.CSSProperties = {
    minWidth: 50,
  };

  const isFirstPageDisabled = isDisabled || currentPageNumber === 1 || !currentPageNumber;
  const isLastPageDisabled = isDisabled || currentPageNumber === totalPagesCount;
  const isPrevPageDisabled = isFirstPageDisabled;
  const isNextPageDisabled = isLastPageDisabled;

  if (totalPagesCount < 2) {
    return null;
  }

  return (
    <ul className="pagination" style={paginationStyle}>
      <PaginationItem
        content="First"
        linkPageNumber={1}
        style={paginationItemsStyle}
        isDisabled={isFirstPageDisabled}
        onPageNumberUpdate={onPageNumberUpdate}
      ></PaginationItem>
      <PaginationItem
        content="Prev"
        linkPageNumber={currentPageNumber ? currentPageNumber - 1 : 1}
        style={paginationItemsStyle}
        isDisabled={isPrevPageDisabled}
        onPageNumberUpdate={onPageNumberUpdate}
      ></PaginationItem>
      {paginationItems.map((pageNumber, index) => {
        const isSelected = pageNumber === currentPageNumber || (pageNumber === 1 && !currentPageNumber);
        return (
          <PaginationItem
            key={index}
            content={pageNumber}
            linkPageNumber={pageNumber}
            isSelected={isSelected}
            isDisabled={isDisabled}
            onPageNumberUpdate={onPageNumberUpdate}
          ></PaginationItem>
        );
      })}
      <PaginationItem
        content="Next"
        linkPageNumber={currentPageNumber ? currentPageNumber + 1 : 2}
        style={paginationItemsStyle}
        isDisabled={isNextPageDisabled}
        onPageNumberUpdate={onPageNumberUpdate}
      ></PaginationItem>
      <PaginationItem
        content="Last"
        linkPageNumber={totalPagesCount}
        style={paginationItemsStyle}
        isDisabled={isLastPageDisabled}
        onPageNumberUpdate={onPageNumberUpdate}
      ></PaginationItem>
    </ul>
  );
};

export default Pagination;
