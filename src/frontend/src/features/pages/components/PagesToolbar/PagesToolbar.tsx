import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, IconButton, Popover, styled, Toolbar, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { ConfirmationDialog } from 'src/features/__shared__/components';
import {
  useAppDispatch,
  useDialog,
  usePopover,
  useAppSelector,
} from 'src/features/__shared__/hooks';
import { useToolbarStyles } from 'src/features/__shared__/styles';
import { PageCreateEdit } from 'src/features/pages/models';
import { createPage, deletePages } from 'src/features/pages/thunks';
import PageCreateEditDialog from '../PageCreateEditDialog';
import PagesFilter from '../PagesFilter';
import ShowMoreTableOptions from '../ShowMoreTableOptions';

const StyledTableHeader = styled(Typography)(({ theme }) => ({ ...theme.typography.h2 }));

type PagesToolbarProps = React.PropsWithChildren<unknown>;

const PagesToolbar: React.FC<PagesToolbarProps> = ({ children }) => {
  const classes = useToolbarStyles();
  const selectedPageIds = useAppSelector(state => state.pages.selectedPageIds);
  const dispatch = useAppDispatch();

  const [filter, showFilter] = usePopover();

  const pageCreateDialog = useDialog<PageCreateEdit>(page => {
    dispatch(createPage(page));
  });

  const pagesDeleteDialog = useDialog(() => {
    dispatch(deletePages(selectedPageIds));
  });

  const handleAddClick = (): void => {
    pageCreateDialog.show();
  };

  const handleDeleteClick = (): void => {
    pagesDeleteDialog.show();
  };

  return (
    <Toolbar className={classes.root}>
      <PageCreateEditDialog {...pageCreateDialog.binding} />
      <ConfirmationDialog
        {...pagesDeleteDialog.binding}
        dialogTitle="Delete pages confirmation"
        dialogMessage="Do you really want to delete all selected pages?"
      />
      {selectedPageIds.length > 0 ? (
        <React.Fragment>
          <Box flexGrow={1}>
            <Typography>{selectedPageIds.length} selected</Typography>
          </Box>
          <Tooltip title="Delete selected pages">
            <span>
              <IconButton onClick={handleDeleteClick} size="large">
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      ) : (
        <React.Fragment>
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
              <IconButton onClick={handleAddClick} size="large">
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
          <ShowMoreTableOptions />
        </React.Fragment>
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
