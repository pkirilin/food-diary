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
} from '@material-ui/core';
import PagesTableRow from './PagesTableRow';
import { selectAllPages } from '../slice';
import { useTypedSelector } from '../../__shared__/hooks';

const PagesTable: React.FC = () => {
  const pageItems = useTypedSelector(state => state.pages.pageItems);
  const selectedPagesCount = useTypedSelector(state => state.pages.selectedPageIds.length);
  const areAllPagesSelected = pageItems.length > 0 && pageItems.length === selectedPagesCount;
  const dispatch = useDispatch();

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
              />
            </TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Total calories</TableCell>
            <TableCell>Count notes</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pageItems.map(page => (
            <PagesTableRow key={page.id} page={page}></PagesTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PagesTable;
