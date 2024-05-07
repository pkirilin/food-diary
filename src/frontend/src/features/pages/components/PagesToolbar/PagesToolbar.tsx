import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, IconButton, Popover, Stack, styled, Tooltip, Typography } from '@mui/material';
import {
  type PropsWithChildren,
  type FC,
  useEffect,
  useState,
  type MouseEventHandler,
} from 'react';
import { useAppSelector } from '@/app/store';
import { pagesApi } from '../../api';
import { usePages } from '../../model';
import { AddPage } from '../../ui';
import DeletePagesDialog from '../DeletePagesDialog';
import PagesFilter from '../PagesFilter';
import ShowMoreTableOptions from '../ShowMoreTableOptions';

const StyledTableHeader = styled(Typography)(({ theme }) => ({ ...theme.typography.h2 }));

type PagesToolbarProps = PropsWithChildren<unknown>;

const PagesToolbar: FC<PagesToolbarProps> = ({ children }) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const selectedPageIds = useAppSelector(state => state.pages.selectedPageIds);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [deletePages, deletePagesRequest] = pagesApi.useDeletePagesMutation();
  const pages = usePages();

  useEffect(() => {
    if (deletePagesRequest.isSuccess && pages.isChanged) {
      setIsDeleteDialogOpened(false);
    }
  }, [deletePagesRequest.isSuccess, pages.isChanged]);

  const handleDeleteOpen = (): void => {
    setIsDeleteDialogOpened(true);
  };

  const handleDeleteClose = (): void => {
    setIsDeleteDialogOpened(false);
  };

  const handleDeletePages = (ids: number[]): void => {
    void deletePages(ids);
  };

  const handleFilterOpen: MouseEventHandler<HTMLButtonElement> = event => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (): void => {
    setFilterAnchorEl(null);
  };

  return (
    <Stack direction="row" alignItems="center" p={2}>
      <DeletePagesDialog
        isOpened={isDeleteDialogOpened}
        submitInProgress={deletePagesRequest.isLoading || pages.isFetching}
        pageIds={selectedPageIds}
        onClose={handleDeleteClose}
        onSubmit={handleDeletePages}
      />
      {selectedPageIds.length > 0 ? (
        <>
          <Box flexGrow={1}>
            <Typography>{selectedPageIds.length} selected</Typography>
          </Box>
          <Tooltip title="Delete selected pages">
            <span>
              <IconButton onClick={handleDeleteOpen} size="large">
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </>
      ) : (
        <>
          <Box flexGrow={1}>
            <StyledTableHeader>Pages</StyledTableHeader>
          </Box>
          <Tooltip title="Filter pages">
            <span>
              <IconButton onClick={handleFilterOpen} size="large">
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
          <AddPage />
          <ShowMoreTableOptions />
        </>
      )}
      <Popover
        open={filterAnchorEl !== null}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <PagesFilter />
      </Popover>
      {children}
    </Stack>
  );
};

export default PagesToolbar;
