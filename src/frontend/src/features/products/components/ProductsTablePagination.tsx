import { TablePagination } from '@mui/material';
import { type FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/app/store';
import { productLib, productModel } from '@/entities/product';

const ProductsTablePagination: FC = () => {
  const products = productLib.useProducts();
  const { pageNumber, pageSize } = useAppSelector(state => state.products.filter);
  const dispatch = useDispatch();

  function handleChangePage(
    _: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    pageIndex: number,
  ): void {
    dispatch(productModel.actions.pageNumberChanged(pageIndex + 1));
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>): void {
    const newPageSize = Number(event.target.value);
    dispatch(productModel.actions.pageSizeChanged(newPageSize));
  }

  return (
    <TablePagination
      component="div"
      count={products.totalCount}
      page={pageNumber - 1}
      rowsPerPage={pageSize}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[pageSize]}
    />
  );
};

export default ProductsTablePagination;
