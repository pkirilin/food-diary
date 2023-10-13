import EditIcon from '@mui/icons-material/Edit';
import { TableRow, TableCell, Checkbox, Tooltip, IconButton, Link } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dateFnsFormat from 'date-fns/format';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useDialog, useAppSelector } from '../../__shared__/hooks';
import { PageCreateEdit, PageItem } from '../models';
import { pageSelected } from '../slice';
import { editPage } from '../thunks';
import PageCreateEditDialog from './PageCreateEditDialog';

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
  const pageDate = dateFnsFormat(new Date(page.date), 'dd.MM.yyyy');

  const isPageSelected = useAppSelector(state =>
    state.pages.selectedPageIds.some(id => id === page.id),
  );

  const dispatch = useAppDispatch();

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
      <PageCreateEditDialog {...pageEditDialog.binding} page={page} />
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
          underline="hover"
        >
          {pageDate}
        </Link>
      </TableCell>
      <TableCell align="right">{page.countCalories}</TableCell>
      <TableCell align="right">{page.countNotes}</TableCell>
      <TableCell width="30px">
        <Tooltip title="Edit page">
          <IconButton onClick={handleEditClick} size="large">
            <EditIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default PagesTableRow;
