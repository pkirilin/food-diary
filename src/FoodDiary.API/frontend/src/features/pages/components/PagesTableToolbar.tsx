import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  IconButton,
  List,
  ListItem,
  ListSubheader,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import PageCreateEditDialog from './PageCreateEditDialog';
import PagesFilter from './PagesFilter';
import PagesExportDialog from './PagesExportDialog';
import { PageCreateEdit } from '../models';
import { createPage, deletePages, exportPages, ExportPagesRequest, importPages } from '../thunks';
import { ConfirmationDialog } from '../../__shared__/components';
import { useDialog, usePopover, useTypedSelector } from '../../__shared__/hooks';
import { useToolbarStyles } from '../../__shared__/styles';

const importWarningMessage =
  'Pages import is going to be started. Import may update or overwrite existing data from file and may cause data loss. Continue?';

const PagesTableToolbar: React.FC = () => {
  const classes = useToolbarStyles();

  const selectedPageIds = useTypedSelector(state => state.pages.selectedPageIds);

  const dispatch = useDispatch();

  const [importFile, setImportFile] = useState<File>();

  const [filter, showFilter] = usePopover();
  const [exportOptions, showExportOptions] = usePopover();

  const pageCreateDialog = useDialog<PageCreateEdit>(page => {
    dispatch(createPage(page));
  });

  const pagesDeleteDialog = useDialog(() => {
    dispatch(deletePages(selectedPageIds));
  });

  const pagesImportDialog = useDialog(() => {
    if (importFile) {
      dispatch(importPages(importFile));
    }
  });

  const exportDialog = useDialog<ExportPagesRequest>(exportParams => {
    dispatch(exportPages(exportParams));
  });

  useEffect(() => {
    if (importFile) {
      pagesImportDialog.show();
    }
  }, [importFile]);

  const handleAddClick = (): void => {
    pageCreateDialog.show();
  };

  const handleDeleteClick = (): void => {
    pagesDeleteDialog.show();
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target;

    try {
      const file = event.target.files?.item(0);
      if (file) {
        setImportFile(file);
      }
    } finally {
      // Cleaning file input value. Without this change handler will not be executed
      // if user tries to load file with the same name multiple times
      if (target) {
        target.value = '';
      }
    }
  };

  return (
    <Toolbar className={classes.root}>
      <PageCreateEditDialog {...pageCreateDialog.binding}></PageCreateEditDialog>
      <PagesExportDialog {...exportDialog.binding}></PagesExportDialog>
      <ConfirmationDialog
        {...pagesDeleteDialog.binding}
        dialogTitle="Delete pages confirmation"
        dialogMessage="Do you really want to delete all selected pages?"
      ></ConfirmationDialog>
      <ConfirmationDialog
        {...pagesImportDialog.binding}
        dialogTitle="Import warning"
        dialogMessage={importWarningMessage}
      ></ConfirmationDialog>
      {selectedPageIds.length > 0 ? (
        <React.Fragment>
          <Typography className={classes.title}>{selectedPageIds.length} selected</Typography>
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
            {/* TODO: move this part with file change handler to reusable component */}
            <label>
              <IconButton component="span">
                <PublishIcon />
              </IconButton>
              <input type="file" name="importFile" hidden onChange={handleImportFileChange} />
            </label>
          </Tooltip>
        </React.Fragment>
      )}
      <Tooltip title="Export pages">
        <span>
          <IconButton
            onClick={event => {
              showExportOptions(event);
            }}
          >
            <CloudDownloadIcon />
          </IconButton>
        </span>
      </Tooltip>
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
      <Popover
        {...exportOptions}
        keepMounted
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List subheader={<ListSubheader>Export pages</ListSubheader>}>
          {/* TODO: implement */}
          {/* <ListItem button disabled={selectedPageIds.length === 0}>
            Export selected
          </ListItem> */}
          <ListItem
            button
            onClick={() => {
              exportDialog.show();
            }}
          >
            Export by filter parameters
          </ListItem>
        </List>
      </Popover>
    </Toolbar>
  );
};

export default PagesTableToolbar;
