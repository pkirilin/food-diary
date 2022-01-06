import React from 'react';
import { useDispatch } from 'react-redux';
import { TablePagination } from '@material-ui/core';
import { pageNumberChanged, pageSizeChanged } from '../slice';
import { useTypedSelector } from '../../__shared__/hooks';

const ProductsTablePagination: React.FC = () => {
  const totalProductsCount = useTypedSelector(state => state.products.totalProductsCount);
  const { pageNumber, pageSize } = useTypedSelector(state => state.products.filter);
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
      onChangeRowsPerPage={handleChangeRowsPerPage}
    />
  );
};

export default ProductsTablePagination;
