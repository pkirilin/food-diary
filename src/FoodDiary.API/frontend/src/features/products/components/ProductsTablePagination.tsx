import React from 'react';
import { useDispatch } from 'react-redux';
import { TablePagination } from '@mui/material';
import { pageNumberChanged, pageSizeChanged } from '../slice';
import { useAppSelector } from '../../__shared__/hooks';

const ProductsTablePagination: React.FC = () => {
  const totalProductsCount = useAppSelector(state => state.products.totalProductsCount);
  const { pageNumber, pageSize } = useAppSelector(state => state.products.filter);
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
      count={totalProductsCount}
      page={pageNumber - 1}
      rowsPerPage={pageSize}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default ProductsTablePagination;
