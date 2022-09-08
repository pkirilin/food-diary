import { TablePagination } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../__shared__/hooks';
import { pageNumberChanged, pageSizeChanged } from '../slice';

const ProductsTablePagination: React.FC = () => {
  const totalProductsCount = useAppSelector(state => state.products.totalProductsCount);
  const { pageNumber, pageSize } = useAppSelector(state => state.products.filter);
  const dispatch = useDispatch();

  function handleChangePage(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    pageIndex: number,
  ): void {
    dispatch(pageNumberChanged(pageIndex + 1));
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>): void {
    const newPageSize = Number(event.target.value);
    dispatch(pageSizeChanged(newPageSize));
  }

  return (
    <TablePagination
      component="div"
      count={totalProductsCount}
      page={pageNumber - 1}
      rowsPerPage={pageSize}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[pageSize]}
    />
  );
};

export default ProductsTablePagination;
