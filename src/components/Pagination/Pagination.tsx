import React, { useState, useEffect } from 'react';
import './Pagination.scss';
import PaginationItem from './PaginationItem';
import { useQuery } from '../../hooks';
import updatePageRanges from './pageRangesUpdater';
import createNumericRange from './range';

interface PaginationProps {
  totalPagesCount: number;
  maxVisiblePagesCount?: number;
  isDisabled?: boolean;
  marginTop?: string | number;
  onPageNumberUpdate?: (newPageNumber?: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPagesCount,
  maxVisiblePagesCount = 10,
  isDisabled = false,
  marginTop = 0,
  onPageNumberUpdate,
}: PaginationProps) => {
  const [visiblePageRanges, setVisiblePageRanges] = useState<[number, number]>();

  const query = useQuery();
  const queryPageNumber = query.get('pageNumber');
  const currentPageNumberFromQuery =
    queryPageNumber !== null && !isNaN(+queryPageNumber) ? +queryPageNumber : undefined;

  useEffect(() => {
    const newPageNumber = currentPageNumberFromQuery === undefined ? 1 : currentPageNumberFromQuery;
    const newPageRanges = updatePageRanges(newPageNumber, totalPagesCount, maxVisiblePagesCount);
    setVisiblePageRanges(newPageRanges);

    if (onPageNumberUpdate) {
      onPageNumberUpdate(newPageNumber);
    }
  }, [currentPageNumberFromQuery, totalPagesCount, maxVisiblePagesCount, onPageNumberUpdate]);

  const paginationItems = visiblePageRanges ? createNumericRange(visiblePageRanges[0], visiblePageRanges[1]) : [];

  const paginationStyle: React.CSSProperties = {
    marginTop,
  };

  const paginationItemsStyle: React.CSSProperties = {
    minWidth: 50,
  };

  const isFirstPageDisabled =
    isDisabled || currentPageNumberFromQuery === 1 || currentPageNumberFromQuery === undefined;
  const isLastPageDisabled = isDisabled || currentPageNumberFromQuery === totalPagesCount;
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
      ></PaginationItem>
      <PaginationItem
        content="Prev"
        linkPageNumber={currentPageNumberFromQuery ? currentPageNumberFromQuery - 1 : 1}
        style={paginationItemsStyle}
        isDisabled={isPrevPageDisabled}
      ></PaginationItem>
      {paginationItems.map((pageNumber, index) => {
        const isSelected =
          pageNumber === currentPageNumberFromQuery || (pageNumber === 1 && currentPageNumberFromQuery === undefined);
        return (
          <PaginationItem
            key={index}
            content={pageNumber}
            linkPageNumber={pageNumber}
            isSelected={isSelected}
            isDisabled={isDisabled}
          ></PaginationItem>
        );
      })}
      <PaginationItem
        content="Next"
        linkPageNumber={currentPageNumberFromQuery ? currentPageNumberFromQuery + 1 : 2}
        style={paginationItemsStyle}
        isDisabled={isNextPageDisabled}
      ></PaginationItem>
      <PaginationItem
        content="Last"
        linkPageNumber={totalPagesCount}
        style={paginationItemsStyle}
        isDisabled={isLastPageDisabled}
      ></PaginationItem>
    </ul>
  );
};

export default Pagination;
