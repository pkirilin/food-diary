import { TablePagination } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../__shared__/hooks';
import { useProductsQuery } from '../api';
import { selectProductsQueryArg } from '../selectors';
import { pageNumberChanged, pageSizeChanged } from '../store';

const ProductsTablePagination: React.FC = () => {
  const productsQueryArg = useAppSelector(selectProductsQueryArg);
  const { data: productsQueryData } = useProductsQuery(productsQueryArg);
  const totalProductsCount = productsQueryData ? productsQueryData.totalProductsCount : 0;
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
