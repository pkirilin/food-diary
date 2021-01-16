import React from 'react';
import { TablePagination } from '@material-ui/core';

const totalPagesCount = 0;
const pageNumber = 1;
const pageSize = 10;

const ProductsTablePagination: React.FC = () => {
  const handleChangePage = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pageIndex: number,
  ): void => {
    return;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    return;
  };

  return (
    <TablePagination
      component="div"
      count={totalPagesCount}
      page={pageNumber - 1}
      rowsPerPage={pageSize}
      onChangePage={handleChangePage}
      onChangeRowsPerPage={handleChangeRowsPerPage}
    />
  );
};

export default ProductsTablePagination;
