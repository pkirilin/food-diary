import React from 'react';
import { useDispatch } from 'react-redux';
import { TableRow, TableCell, Checkbox, Tooltip, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { PageItem } from '../models';
import { useTypedSelector } from '../../__shared__/hooks';
import { selectPage } from '../slice';

type PagesTableRowProps = {
  page: PageItem;
};

const PagesTableRow: React.FC<PagesTableRowProps> = ({ page }: PagesTableRowProps) => {
  const isPageSelected = useTypedSelector(state =>
    state.pages.selectedPageIds.some(id => id === page.id),
  );

  const dispatch = useDispatch();

  const handleSelectPage = (): void => {
    dispatch(
      selectPage({
        pageId: page.id,
        selected: !isPageSelected,
      }),
    );
  };

  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox color="primary" checked={isPageSelected} onChange={handleSelectPage} />
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
