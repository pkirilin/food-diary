import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import PagesTableRow from './PagesTableRow';
import { selectAllPages } from '../slice';
import { getPages } from '../thunks';
import { useRefreshEffect, useTypedSelector } from '../../__shared__/hooks';
import { SortOrder } from '../../__shared__/models';

const PagesTable: React.FC = () => {
  const pageItems = useTypedSelector(state => state.pages.pageItems);
  const selectedPagesCount = useTypedSelector(state => state.pages.selectedPageIds.length);
  const pageItemsFilter = useTypedSelector(state => state.pages.filter);

  const areAllPagesSelected = pageItems.length > 0 && pageItems.length === selectedPagesCount;

  const dispatch = useDispatch();

  useRefreshEffect(
    state => state.pages.operationStatus,
    () => {
      const { pageNumber, pageSize } = pageItemsFilter;

      dispatch(
        getPages({
          sortOrder: SortOrder.Descending,
          pageNumber,
          pageSize,
        }),
      );
    },
    [pageItemsFilter],
  );

  const handleSelectAllPages = (): void => {
    dispatch(
      selectAllPages({
        selected: !areAllPagesSelected,
      }),
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
            <TableCell>Date</TableCell>
            <TableCell>Total calories</TableCell>
            <TableCell>Count notes</TableCell>
            <TableCell></TableCell>
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
            <PagesTableRow key={page.id} page={page}></PagesTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PagesTable;
