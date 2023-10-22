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
import { SortOrder, Status } from '../../../__shared__/models';
import { PageItem, PageItemsFilter } from '../../models';
import PagesTableRow from '../PagesTableRow';

type PagesTableProps = {
  pages: PageItem[];
  selectedPagesCount: number;
  filter: PageItemsFilter;
  operationStatus: Status;
  onRefetch: (filter: PageItemsFilter) => void;
  onSelectAll: (isSelected: boolean) => void;
  onReorder: (order: SortOrder) => void;
};

const PagesTable: React.FC<PagesTableProps> = ({
  pages,
  selectedPagesCount,
  filter,
  operationStatus,
  onRefetch,
  onSelectAll,
  onReorder,
}) => {
  const [sortDirectionByDate, setSortDirectionByDate] = useState<'asc' | 'desc'>();

  const areAllPagesSelected = pages.length > 0 && pages.length === selectedPagesCount;

  useEffect(() => {
    if (operationStatus === 'idle' || operationStatus === 'succeeded') {
      onRefetch(filter);
    }
  }, [filter, onRefetch, operationStatus]);

  useEffect(() => {
    setSortDirectionByDate(filter.sortOrder === SortOrder.Ascending ? 'asc' : 'desc');
  }, [filter.sortOrder]);

  const handleSelectAllPages = (): void => {
    onSelectAll(areAllPagesSelected);
  };

  const handleReorder = (): void => {
    onReorder(sortDirectionByDate === 'asc' ? SortOrder.Descending : SortOrder.Ascending);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={selectedPagesCount > 0 && selectedPagesCount < pages.length}
                checked={areAllPagesSelected}
                onChange={handleSelectAllPages}
                disabled={pages.length === 0}
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
          {pages.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography color="textSecondary">No pages found</Typography>
              </TableCell>
            </TableRow>
          )}
          {pages.map(page => (
            <PagesTableRow key={page.id} page={page} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PagesTable;
