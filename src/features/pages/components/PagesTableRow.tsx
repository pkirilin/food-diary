import React from 'react';
import { TableRow, TableCell, Checkbox, Tooltip, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { PageItem } from '../models';

type PagesTableRowProps = {
  page: PageItem;
};

const PagesTableRow: React.FC<PagesTableRowProps> = ({ page }: PagesTableRowProps) => {
  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          // checked={rowCount > 0 && numSelected === rowCount}
          // onChange={onSelectAllClick}
        />
      </TableCell>
      <TableCell>{page.date}</TableCell>
      <TableCell>{page.countCalories}</TableCell>
      <TableCell>{page.countNotes}</TableCell>
      <TableCell width="30px">
        <Tooltip title="Edit page">
          <IconButton>
            <EditIcon></EditIcon>
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default PagesTableRow;
