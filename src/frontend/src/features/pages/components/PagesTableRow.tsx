import EditIcon from '@mui/icons-material/Edit';
import { TableRow, TableCell, Checkbox, Tooltip, IconButton, Link } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from 'src/utils';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { type PageCreateEdit, type PageItem } from '../models';
import { pageSelected } from '../slice';
import { editPage } from '../thunks';
import { PageInputDialog } from './PageInputDialog';

interface PagesTableRowProps {
  page: PageItem;
}

const PagesTableRow: FC<PagesTableRowProps> = ({ page }: PagesTableRowProps) => {
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

  const handleOpenDialog = (): void => {
    setIsDialogOpened(true);
  };

  const handleCloseDialog = (): void => {
    setIsDialogOpened(false);
  };

  const handleEditPage = ({ date }: PageCreateEdit): void => {
    void dispatch(
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
