import EditIcon from '@mui/icons-material/Edit';
import { TableRow, TableCell, Checkbox, Tooltip, IconButton, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from 'src/utils';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { PageCreateEdit, PageItem } from '../models';
import { pageSelected } from '../slice';
import { editPage } from '../thunks';
import { PageInputDialog } from './PageInputDialog';

type PagesTableRowProps = {
  page: PageItem;
};

const PagesTableRow: React.FC<PagesTableRowProps> = ({ page }: PagesTableRowProps) => {
  const pageDate = new Date(page.date);

  const operationStatus = useAppSelector(state => state.pages.operationStatus);

  const isPageSelected = useAppSelector(state =>
    state.pages.selectedPageIds.some(id => id === page.id),
  );

  const dispatch = useAppDispatch();

  const [isDialogOpened, setIsDialogOpened] = useState(false);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      setIsDialogOpened(false);
    }
  }, [operationStatus]);

  const handleOpenDialog = () => {
    setIsDialogOpened(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpened(false);
  };

  const handleEditPage = ({ date }: PageCreateEdit) => {
    dispatch(
      editPage({
        id: page.id,
        page: { date },
      }),
    );
  };

  const handleSelectPage = (): void => {
    dispatch(
      pageSelected({
        pageId: page.id,
        selected: !isPageSelected,
      }),
    );
  };

  return (
    <TableRow hover>
      <PageInputDialog
        title="Edit page"
        submitText="Save"
        isOpened={isDialogOpened}
        initialDate={pageDate}
        onClose={handleCloseDialog}
        onSubmit={handleEditPage}
      />
      <TableCell padding="checkbox">
        <Checkbox color="primary" checked={isPageSelected} onChange={handleSelectPage} />
      </TableCell>
      <TableCell>
        <Link
          component={RouterLink}
          to={`/pages/${page.id}`}
          variant="body1"
          color="primary"
          underline="hover"
          fontWeight="bold"
        >
          {formatDate(pageDate)}
        </Link>
      </TableCell>
      <TableCell align="right">{page.countCalories}</TableCell>
      <TableCell align="right">{page.countNotes}</TableCell>
      <TableCell width="30px">
        <Tooltip title="Edit page">
          <IconButton onClick={handleOpenDialog} size="large">
            <EditIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default PagesTableRow;
