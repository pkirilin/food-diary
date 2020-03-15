import React, { useState, useEffect } from 'react';
import './Pagination.scss';
import PaginationItem from './PaginationItem';

interface PaginationProps {
  totalItemsCount: number;
  pageSize?: number;
  maxVisiblePagesCount?: number;
  selectedPage?: number;
  onChangePage?: () => void;
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
  selectedPage,
  onChangePage,
}: PaginationProps) => {
  const totalPagesCount = Math.ceil(totalItemsCount / pageSize);
  const initialVisiblePageRanges: [number, number] =
    totalPagesCount < maxVisiblePagesCount ? [1, totalPagesCount] : [1, maxVisiblePagesCount];

  const [visiblePageRanges, setVisiblePageRanges] = useState<[number, number]>(initialVisiblePageRanges);
  const [paginationItems, setPaginationItems] = useState<number[]>([]);
  const [selectedPageNumber, setSelectedPageNumber] = useState(selectedPage);

  useEffect(() => {
    if (visiblePageRanges) {
      const [startPage, endPage] = visiblePageRanges;
      setPaginationItems(createNumericRange(startPage, endPage));
    }
  }, [visiblePageRanges, setPaginationItems]);

  function getNewPageRanges(selectedPage: number): [number, number] {
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
  }

  function handlePaginationItemClick(this: number): void {
    setSelectedPageNumber(this);

    if (visiblePageRanges) {
      const newPageRanges = getNewPageRanges(this);
      setVisiblePageRanges(newPageRanges);
    }

    if (onChangePage) {
      onChangePage();
    }
  }

  const paginationItemsStyle: React.CSSProperties = {
    minWidth: 50,
  };

  const isPageDisabled = false;
  const isFirstPageDisabled = isPageDisabled || selectedPageNumber === visiblePageRanges[0];
  const isLastPageDisabled = isPageDisabled || selectedPageNumber === visiblePageRanges[1];
  const isPrevPageDisabled = isFirstPageDisabled;
  const isNextPageDisabled = isLastPageDisabled;

  return (
    <div className="pagination">
      <PaginationItem
        content="First"
        style={paginationItemsStyle}
        isDisabled={isFirstPageDisabled}
        onClick={handlePaginationItemClick.bind(1)}
      ></PaginationItem>
      <PaginationItem
        content="Prev"
        style={paginationItemsStyle}
        isDisabled={isPrevPageDisabled}
        onClick={handlePaginationItemClick.bind(selectedPageNumber ? selectedPageNumber - 1 : 0)}
      ></PaginationItem>
      {paginationItems.map((pageNumber, index) => {
        const isSelected = pageNumber === selectedPageNumber;
        return (
          <PaginationItem
            key={index}
            content={pageNumber}
            isSelected={isSelected}
            isDisabled={isPageDisabled}
            onClick={handlePaginationItemClick.bind(pageNumber)}
          ></PaginationItem>
        );
      })}
      <PaginationItem
        content="Next"
        style={paginationItemsStyle}
        isDisabled={isNextPageDisabled}
        onClick={handlePaginationItemClick.bind(selectedPageNumber ? selectedPageNumber + 1 : 0)}
      ></PaginationItem>
      <PaginationItem
        content="Last"
        style={paginationItemsStyle}
        isDisabled={isLastPageDisabled}
        onClick={handlePaginationItemClick.bind(totalPagesCount)}
      ></PaginationItem>
    </div>
  );
};

export default Pagination;
