import React from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Popover, Toolbar, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import PageCreateEditDialog from './PageCreateEditDialog';
import PagesFilter from './PagesFilter';
import { PageCreateEdit } from '../models';
import { createPage, deletePages } from '../thunks';
import { ConfirmationDialog } from '../../__shared__/components';
import { useDialog, usePopover, useTypedSelector } from '../../__shared__/hooks';
import { useToolbarStyles } from '../../__shared__/styles';

const PagesTableToolbar: React.FC = () => {
  const classes = useToolbarStyles();

  const selectedPageIds = useTypedSelector(state => state.pages.selectedPageIds);

  const dispatch = useDispatch();

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
      <PageCreateEditDialog {...pageCreateDialog.binding}></PageCreateEditDialog>
      <ConfirmationDialog
        dialogTitle="Delete pages confirmation"
        dialogMessage="Do you really want to delete all selected pages?"
        {...pagesDeleteDialog.binding}
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
              <IconButton
                onClick={event => {
                  showFilter(event);
                }}
              >
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
        <PagesFilter></PagesFilter>
      </Popover>
    </Toolbar>
  );
};

export default PagesTableToolbar;
