import React, { useState, useEffect } from 'react';
import './Pagination.scss';
import PaginationItem from './PaginationItem';
import { useQuery } from '../../hooks';

interface PaginationProps {
  totalItemsCount: number;
  pageSize?: number;
  maxVisiblePagesCount?: number;
}

// TODO: argument checks, move to utils
const createNumericRange = (startNumber: number, endNumber: number): number[] => {
  const range = new Array<number>();
  let currentNumber = startNumber - 1;
  for (let i = 0; i < endNumber - startNumber + 1; i++) {
    range.push(++currentNumber);
  }
  return range;
};

const Pagination: React.FC<PaginationProps> = ({
  totalItemsCount,
  pageSize = 10,
  maxVisiblePagesCount = 10,
}: PaginationProps) => {
  const totalPagesCount = Math.ceil(totalItemsCount / pageSize);

  const initialVisiblePageRanges: [number, number] =
    totalPagesCount < maxVisiblePagesCount ? [1, totalPagesCount] : [1, maxVisiblePagesCount];

  const [visiblePageRanges, setVisiblePageRanges] = useState<[number, number]>(initialVisiblePageRanges);

  const query = useQuery();
  const queryPageNumber = query.get('pageNumber');
  const currentPageNumberFromQuery = queryPageNumber !== null && !isNaN(+queryPageNumber) ? +queryPageNumber : 0;

  useEffect(() => {
    const getNewPageRanges = (selectedPage: number): [number, number] => {
      const [startPage, endPage] = visiblePageRanges;
      const middlePage = Math.floor((startPage + endPage) / 2);
      const middlePageOffset = selectedPage - middlePage;
      const currentVisiblePagesCount = endPage - startPage + 1;

      let newStartPage = startPage + middlePageOffset;
      let newEndPage = endPage + middlePageOffset;

      if (newEndPage > totalPagesCount) {
        newStartPage = totalPagesCount - currentVisiblePagesCount + 1;
        newEndPage = totalPagesCount;
      } else if (newStartPage < 1) {
        newStartPage = 1;
        newEndPage = currentVisiblePagesCount;
      }

      return [newStartPage, newEndPage];
    };

    const newPageRanges = getNewPageRanges(currentPageNumberFromQuery);
    setVisiblePageRanges(newPageRanges);

    // TODO: think about possible mistake with no passing `visiblePageRanges`
    // eslint-disable-next-line
  }, [currentPageNumberFromQuery, totalPagesCount]);

  const paginationItems = visiblePageRanges ? createNumericRange(visiblePageRanges[0], visiblePageRanges[1]) : [];

  const paginationItemsStyle: React.CSSProperties = {
    minWidth: 50,
  };

  const isPageDisabled = false;
  const isFirstPageDisabled = isPageDisabled || currentPageNumberFromQuery === visiblePageRanges[0];
  const isLastPageDisabled = isPageDisabled || currentPageNumberFromQuery === visiblePageRanges[1];
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
        const isSelected = pageNumber === currentPageNumberFromQuery;
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
