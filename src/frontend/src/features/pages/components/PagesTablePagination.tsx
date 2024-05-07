import { TablePagination } from '@mui/material';
import { type FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/app/store';
import { pageNumberChanged, pageSizeChanged } from '../slice';

interface PagesTablePaginationProps {
  totalPagesCount: number;
}

const PagesTablePagination: FC<PagesTablePaginationProps> = ({ totalPagesCount }) => {
  const pageNumber = useAppSelector(state => state.pages.filter.pageNumber);
  const pageSize = useAppSelector(state => state.pages.filter.pageSize);
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
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default PagesTablePagination;
