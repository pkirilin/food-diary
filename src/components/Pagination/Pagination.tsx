import React, { useState, useEffect } from 'react';
import './Pagination.scss';
import PaginationItem from './PaginationItem';
import { useQuery } from '../../hooks';
import updatePageRanges from './pageRangesUpdater';
import createNumericRange from './range';

interface PaginationProps {
  totalPagesCount: number;
  maxVisiblePagesCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalPagesCount, maxVisiblePagesCount = 10 }: PaginationProps) => {
  const [visiblePageRanges, setVisiblePageRanges] = useState<[number, number]>();

  const query = useQuery();
  const queryPageNumber = query.get('pageNumber');
  const currentPageNumberFromQuery = queryPageNumber !== null && !isNaN(+queryPageNumber) ? +queryPageNumber : null;

  useEffect(() => {
    const newPageRanges = updatePageRanges(
      currentPageNumberFromQuery === null ? 1 : currentPageNumberFromQuery,
      totalPagesCount,
      maxVisiblePagesCount,
    );
    setVisiblePageRanges(newPageRanges);
  }, [currentPageNumberFromQuery, totalPagesCount, maxVisiblePagesCount]);

  const paginationItems = visiblePageRanges ? createNumericRange(visiblePageRanges[0], visiblePageRanges[1]) : [];

  const paginationItemsStyle: React.CSSProperties = {
    minWidth: 50,
  };

  const isPageDisabled = false;
  const isFirstPageDisabled = isPageDisabled || currentPageNumberFromQuery === 1 || currentPageNumberFromQuery === null;
  const isLastPageDisabled = isPageDisabled || currentPageNumberFromQuery === totalPagesCount;
  const isPrevPageDisabled = isFirstPageDisabled;
  const isNextPageDisabled = isLastPageDisabled;

  if (totalPagesCount < 2) {
    return null;
  }

  return (
    <ul className="pagination">
      <PaginationItem
        content="First"
        linkPageNumber={1}
        style={paginationItemsStyle}
        isDisabled={isFirstPageDisabled}
      ></PaginationItem>
      <PaginationItem
        content="Prev"
        linkPageNumber={currentPageNumberFromQuery ? currentPageNumberFromQuery - 1 : 0}
        style={paginationItemsStyle}
        isDisabled={isPrevPageDisabled}
      ></PaginationItem>
      {paginationItems.map((pageNumber, index) => {
        const isSelected =
          pageNumber === currentPageNumberFromQuery || (pageNumber === 1 && currentPageNumberFromQuery === null);
        return (
          <PaginationItem
            key={index}
            content={pageNumber}
            linkPageNumber={pageNumber}
            isSelected={isSelected}
            isDisabled={isPageDisabled}
          ></PaginationItem>
        );
      })}
      <PaginationItem
        content="Next"
        linkPageNumber={currentPageNumberFromQuery ? currentPageNumberFromQuery + 1 : 0}
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
