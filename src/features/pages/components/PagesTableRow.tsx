import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TableRow, TableCell, Checkbox, Tooltip, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { PageItem } from '../models';
import { useTypedSelector } from '../../__shared__/hooks';
import { selectPage } from '../slice';
import PageCreateEditDialog from './PageCreateEditDialog';

type PagesTableRowProps = {
  page: PageItem;
};

const PagesTableRow: React.FC<PagesTableRowProps> = ({ page }: PagesTableRowProps) => {
  const isPageSelected = useTypedSelector(state =>
    state.pages.selectedPageIds.some(id => id === page.id),
  );

  const dispatch = useDispatch();
  const [pageCreateEditDialogOpen, setPageCreateEditDialogOpen] = useState(false);

  const handleSelectPage = (): void => {
    dispatch(
      selectPage({
        pageId: page.id,
        selected: !isPageSelected,
      }),
    );
  };

  const handleEditClick = (): void => {
    setPageCreateEditDialogOpen(true);
  };

  const handleCreateEditDialogComplete = (): void => {
    return;
  };

  const handleCreateEditDialogClose = (): void => {
    setPageCreateEditDialogOpen(false);
  };

  return (
    <TableRow hover>
      <PageCreateEditDialog
        open={pageCreateEditDialogOpen}
        onClose={handleCreateEditDialogClose}
        onDialogCancel={handleCreateEditDialogClose}
        onDialogConfirm={handleCreateEditDialogComplete}
        page={page}
      ></PageCreateEditDialog>
      <TableCell padding="checkbox">
        <Checkbox color="primary" checked={isPageSelected} onChange={handleSelectPage} />
      </TableCell>
      <TableCell>{page.date}</TableCell>
      <TableCell>{page.countCalories}</TableCell>
      <TableCell>{page.countNotes}</TableCell>
      <TableCell width="30px">
        <Tooltip title="Edit page">
          <IconButton onClick={handleEditClick}>
            <EditIcon></EditIcon>
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default PagesTableRow;
