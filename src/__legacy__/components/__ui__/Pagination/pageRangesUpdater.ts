const updatePageRanges = (
  selectedPage: number,
  totalPagesCount: number,
  maxVisiblePagesCount: number,
): [number, number] => {
  const actualPagesCount = totalPagesCount > maxVisiblePagesCount ? maxVisiblePagesCount : totalPagesCount;

  if (actualPagesCount < 1) {
    return [0, 0];
  }

  const isSelectedPageOutOfRange = selectedPage < 1 || selectedPage > totalPagesCount;

  if (isSelectedPageOutOfRange) {
    return [1, actualPagesCount];
  }

  const halfActualPagesCount = Math.floor(actualPagesCount / 2);

  const isSelectedPageLeftLimited = selectedPage - halfActualPagesCount < 1;
  if (isSelectedPageLeftLimited) {
    return [1, actualPagesCount];
  }

  const isSelectedPageRightLimited = selectedPage + halfActualPagesCount > totalPagesCount;
  if (isSelectedPageRightLimited) {
    return [totalPagesCount - actualPagesCount + 1, totalPagesCount];
  }

  const isActualPageCountEven = actualPagesCount % 2 === 0;
  const selectedPageOffset = isActualPageCountEven ? 1 : 0;

  return [selectedPage + selectedPageOffset - halfActualPagesCount, selectedPage + halfActualPagesCount];
};

export default updatePageRanges;
