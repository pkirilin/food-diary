import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, makeStyles, Toolbar, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { useTypedSelector } from '../../__shared__/hooks';
import PageCreateEditDialog from './PageCreateEditDialog';
import { PageCreateEdit } from '../models';
import { createPage, deletePages } from '../thunks';
import { ConfirmationDialog } from '../../__shared__/components';

const useStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  title: {
    flex: '1 1 100%',
  },
}));

const PagesTableToolbar: React.FC = () => {
  const classes = useStyles();
  const selectedPageIds = useTypedSelector(state => state.pages.selectedPageIds);
  const [pageCreateEditDialogOpen, setPageCreateEditDialogOpen] = useState(false);
  const [deletePagesDialogOpen, setDeletePagesDialogOpen] = useState(false);
  const dispatch = useDispatch();

  const handleAddClick = (): void => {
    setPageCreateEditDialogOpen(true);
  };

  const handleDeleteClick = (): void => {
    setDeletePagesDialogOpen(true);
  };

  const handleCreateEditDialogConfirm = (page: PageCreateEdit): void => {
    setPageCreateEditDialogOpen(false);
    dispatch(createPage(page));
  };

  const handleCreateEditDialogClose = (): void => {
    setPageCreateEditDialogOpen(false);
  };

  const handleDeletePagesDialogConfirm = (): void => {
    setDeletePagesDialogOpen(false);
    dispatch(deletePages(selectedPageIds));
  };

  const handleDeletePagesDialogClose = (): void => {
    setDeletePagesDialogOpen(false);
  };

  return (
    <Toolbar className={classes.root}>
      <PageCreateEditDialog
        open={pageCreateEditDialogOpen}
        onClose={handleCreateEditDialogClose}
        onDialogConfirm={handleCreateEditDialogConfirm}
        onDialogCancel={handleCreateEditDialogClose}
      ></PageCreateEditDialog>
      <ConfirmationDialog
        open={deletePagesDialogOpen}
        dialogTitle="Delete pages confirmation"
        dialogMessage="Do you really want to delete all selected pages?"
        onDialogConfirm={handleDeletePagesDialogConfirm}
        onDialogCancel={handleDeletePagesDialogClose}
      ></ConfirmationDialog>
      {selectedPageIds.length > 0 ? (
        <React.Fragment>
          <Typography className={classes.title}>{selectedPageIds.length} selected</Typography>
          <Tooltip title="Export selected pages">
            <span>
              <IconButton disabled>
                <CloudDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete selected pages">
            <span>
              <IconButton onClick={handleDeleteClick}>
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography variant="h1" className={classes.title}>
            Pages
          </Typography>
          <Tooltip title="Add new page">
            <span>
              <IconButton onClick={handleAddClick}>
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Filter pages">
            <span>
              <IconButton disabled>
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Import pages">
            <span>
              <IconButton disabled>
                <PublishIcon />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      )}
    </Toolbar>
  );
};

export default PagesTableToolbar;
