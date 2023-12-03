import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, IconButton, Popover, styled, Toolbar, Tooltip, Typography } from '@mui/material';
import { type PropsWithChildren, type FC, useEffect, useState } from 'react';
import { useAppDispatch, usePopover, useAppSelector } from 'src/features/__shared__/hooks';
import { useToolbarStyles } from 'src/features/__shared__/styles';
import { type PageCreateEdit } from 'src/features/pages/models';
import { createPage, deletePages } from 'src/features/pages/thunks';
import { useDateForNewPage } from '../../hooks';
import DeletePagesDialog from '../DeletePagesDialog';
import { PageInputDialog } from '../PageInputDialog';
import PagesFilter from '../PagesFilter';
import ShowMoreTableOptions from '../ShowMoreTableOptions';

const StyledTableHeader = styled(Typography)(({ theme }) => ({ ...theme.typography.h2 }));

type PagesToolbarProps = PropsWithChildren<unknown>;

const PagesToolbar: FC<PagesToolbarProps> = ({ children }) => {
  const classes = useToolbarStyles();
  const selectedPageIds = useAppSelector(state => state.pages.selectedPageIds);
  const operationStatus = useAppSelector(state => state.pages.operationStatus);
  const dispatch = useAppDispatch();

  const [isInputDialogOpened, setIsInputDialogOpened] = useState(false);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);

  const [filter, showFilter] = usePopover();
  const dateForNewPage = useDateForNewPage(isInputDialogOpened);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      setIsInputDialogOpened(false);
      setIsDeleteDialogOpened(false);
    }
  }, [operationStatus]);

  const handleInputOpen = (): void => {
    setIsInputDialogOpened(true);
  };

  const handleInputClose = (): void => {
    setIsInputDialogOpened(false);
  };

  const handleCreatePage = (page: PageCreateEdit): void => {
    void dispatch(createPage(page));
  };

  const handleDeleteOpen = (): void => {
    setIsDeleteDialogOpened(true);
  };

  const handleDeleteClose = (): void => {
    setIsDeleteDialogOpened(false);
  };

  const handleDeletePages = (ids: number[]): void => {
    void dispatch(deletePages(ids));
  };

  return (
    <Toolbar className={classes.root}>
      <PageInputDialog
        title="New page"
        submitText="Create"
        initialDate={dateForNewPage}
        isOpened={isInputDialogOpened}
        onClose={handleInputClose}
        onSubmit={handleCreatePage}
      />
      <DeletePagesDialog
        isOpened={isDeleteDialogOpened}
        isLoading={operationStatus === 'pending'}
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
              <IconButton
                onClick={event => {
                  showFilter(event);
                }}
                size="large"
              >
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Add new page">
            <span>
              <IconButton onClick={handleInputOpen} size="large">
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
          <ShowMoreTableOptions />
        </>
      )}
      <Popover
        {...filter}
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
    </Toolbar>
  );
};

export default PagesToolbar;
