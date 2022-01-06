import React from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  TableRow,
  TableCell,
  Checkbox,
  Tooltip,
  IconButton,
  Link,
  makeStyles,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { PageCreateEdit, PageItem } from '../models';
import { useDialog, useTypedSelector } from '../../__shared__/hooks';
import { pageSelected } from '../slice';
import PageCreateEditDialog from './PageCreateEditDialog';
import { editPage } from '../thunks';

type PagesTableRowProps = {
  page: PageItem;
};

const useStyles = makeStyles(() => ({
  pageDateLink: {
    // TODO: use theme value after Material 5 migration
    fontWeight: 'bold',
  },
}));

const PagesTableRow: React.FC<PagesTableRowProps> = ({ page }: PagesTableRowProps) => {
  const classes = useStyles();
  const pageDate = new Date(page.date).toLocaleDateString();

  const isPageSelected = useTypedSelector(state =>
    state.pages.selectedPageIds.some(id => id === page.id),
  );

  const dispatch = useDispatch();

  const pageEditDialog = useDialog<PageCreateEdit>(pageInfo => {
    dispatch(
      editPage({
        id: page.id,
        page: pageInfo,
      }),
    );
  });

  const handleSelectPage = (): void => {
    dispatch(
      pageSelected({
        pageId: page.id,
        selected: !isPageSelected,
      }),
    );
  };

  const handleEditClick = (): void => {
    pageEditDialog.show();
  };

  return (
    <TableRow hover>
      <PageCreateEditDialog {...pageEditDialog.binding} page={page}></PageCreateEditDialog>
      <TableCell padding="checkbox">
        <Checkbox color="primary" checked={isPageSelected} onChange={handleSelectPage} />
      </TableCell>
      <TableCell>
        <Link
          component={RouterLink}
          to={`/pages/${page.id}`}
          variant="body1"
          color="primary"
          className={classes.pageDateLink}
        >
          {pageDate}
        </Link>
      </TableCell>
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
