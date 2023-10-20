import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useRefreshEffect, useAppSelector } from '../../__shared__/hooks';
import { SortOrder } from '../../__shared__/models';
import { allPagesSelected, sortOrderChanged } from '../slice';
import { getPages } from '../thunks';
import PagesTableRow from './PagesTableRow';

const PagesTable: React.FC = () => {
  const pageItems = useAppSelector(state => state.pages.pageItems);
  const selectedPagesCount = useAppSelector(state => state.pages.selectedPageIds.length);
  const pageItemsFilter = useAppSelector(state => state.pages.filter);

  const [sortDirectionByDate, setSortDirectionByDate] = useState<'asc' | 'desc'>();

  const areAllPagesSelected = pageItems.length > 0 && pageItems.length === selectedPagesCount;

  const dispatch = useAppDispatch();

  useRefreshEffect(
    state => state.pages.operationStatus,
    () => {
      const { pageNumber, pageSize, startDate, endDate, sortOrder } = pageItemsFilter;

      dispatch(
        getPages({
          sortOrder,
          pageNumber,
          pageSize,
          startDate: startDate ?? null,
          endDate: endDate ?? null,
        }),
      );
    },
    [pageItemsFilter],
  );

  useEffect(() => {
    setSortDirectionByDate(pageItemsFilter.sortOrder === SortOrder.Ascending ? 'asc' : 'desc');
  }, [pageItemsFilter.sortOrder]);

  const handleSelectAllPages = (): void => {
    dispatch(
      allPagesSelected({
        selected: !areAllPagesSelected,
      }),
    );
  };

  const handleReorder = (): void => {
    dispatch(
      sortOrderChanged(sortDirectionByDate === 'asc' ? SortOrder.Descending : SortOrder.Ascending),
    );
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={selectedPagesCount > 0 && selectedPagesCount < pageItems.length}
                checked={areAllPagesSelected}
                onChange={handleSelectAllPages}
                disabled={pageItems.length === 0}
              />
            </TableCell>
            <TableCell>
              <TableSortLabel active direction={sortDirectionByDate} onClick={handleReorder}>
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Notes</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography color="textSecondary">No pages found</Typography>
              </TableCell>
            </TableRow>
          )}
          {pageItems.map(page => (
            <PagesTableRow key={page.id} page={page} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PagesTable;
