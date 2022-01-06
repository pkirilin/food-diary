import React from 'react';
import { useDispatch } from 'react-redux';
import { TablePagination } from '@material-ui/core';
import { useTypedSelector } from '../../__shared__/hooks';
import { pageNumberChanged, pageSizeChanged } from '../slice';

const PagesTablePagination: React.FC = () => {
  const pageNumber = useTypedSelector(state => state.pages.filter.pageNumber);
  const pageSize = useTypedSelector(state => state.pages.filter.pageSize);
  const totalPagesCount = useTypedSelector(state => state.pages.totalPagesCount);
  const dispatch = useDispatch();

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    pageIndex: number,
  ): void => {
    dispatch(pageNumberChanged(pageIndex + 1));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newPageSize = Number(event.target.value);
    dispatch(pageSizeChanged(newPageSize));
  };

  return (
    <TablePagination
      component="div"
      count={totalPagesCount}
      page={pageNumber - 1}
      rowsPerPage={pageSize}
      onPageChange={handleChangePage}
      onChangeRowsPerPage={handleChangeRowsPerPage}
    />
  );
};

export default PagesTablePagination;
