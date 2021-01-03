import React from 'react';
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

const PagesTable: React.FC = () => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                // indeterminate={numSelected > 0 && numSelected < rowCount}
                // checked={rowCount > 0 && numSelected === rowCount}
                // onChange={onSelectAllClick}
              />
            </TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Total calories</TableCell>
            <TableCell>Count notes</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <PagesTableRow
            page={{
              id: 1,
              date: new Date().toLocaleDateString(),
              countCalories: 2000,
              countNotes: 10,
            }}
          ></PagesTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PagesTable;
