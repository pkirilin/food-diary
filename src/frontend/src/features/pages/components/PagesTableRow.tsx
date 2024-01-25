import EditIcon from '@mui/icons-material/Edit';
import { TableRow, TableCell, Checkbox, Tooltip, IconButton, Link } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from 'src/utils';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { pagesApi } from '../api';
import { toEditPageRequest } from '../mapping';
import { type PageCreateEdit, type PageItem } from '../models';
import { pageSelected } from '../slice';
import { PageInputDialog } from './PageInputDialog';

interface PagesTableRowProps {
  page: PageItem;
}

const PagesTableRow: FC<PagesTableRowProps> = ({ page }: PagesTableRowProps) => {
  const [editPage, editPageRequest] = pagesApi.useEditPageMutation();
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const pageDate = new Date(page.date);
  const dispatch = useAppDispatch();

  const isPageSelected = useAppSelector(state =>
    state.pages.selectedPageIds.some(id => id === page.id),
  );

  useEffect(() => {
    if (editPageRequest.isSuccess) {
      setIsDialogOpened(false);
    }
  }, [editPageRequest.isSuccess]);

  const handleOpenDialog = (): void => {
    setIsDialogOpened(true);
  };

  const handleCloseDialog = (): void => {
    setIsDialogOpened(false);
  };

  const handleEditPage = (newPageData: PageCreateEdit): void => {
    void editPage(toEditPageRequest(page, newPageData));
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
