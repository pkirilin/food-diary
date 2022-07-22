import React, { useCallback, useEffect, useState } from 'react';
import { IconButton, Popover, Toolbar, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import PublishIcon from '@mui/icons-material/Publish';
import DeleteIcon from '@mui/icons-material/Delete';
import PageCreateEditDialog from '../PageCreateEditDialog';
import PagesFilter from '../PagesFilter';
import { PageCreateEdit } from 'src/features/pages/models';
import { createPage, deletePages, importPages } from 'src/features/pages/thunks';
import { ConfirmationDialog } from 'src/features/__shared__/components';
import {
  useAppDispatch,
  useDialog,
  usePopover,
  useAppSelector,
} from 'src/features/__shared__/hooks';
import { useToolbarStyles } from 'src/features/__shared__/styles';

const importWarningMessage =
  'Pages import is going to be started. Import may update or overwrite existing data from file and may cause data loss. Continue?';

function useImport(file?: File) {
  const isSuccess = useAppSelector(state => state.pages.isImportSuccess);
  const dispatch = useAppDispatch();

  const { setOpen, binding: dialogProps } = useDialog(() => {
    if (file) {
      dispatch(importPages(file));
    }
  });

  const openDialog = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (file) {
      openDialog();
    }
  }, [file, openDialog]);

  useEffect(() => {
    if (isSuccess) {
      closeDialog();
    }
  }, [closeDialog, isSuccess]);

  return dialogProps;
}

type PagesToolbarProps = React.PropsWithChildren<unknown>;

const PagesToolbar: React.FC<PagesToolbarProps> = ({ children }) => {
  const classes = useToolbarStyles();
  const selectedPageIds = useAppSelector(state => state.pages.selectedPageIds);
  const dispatch = useAppDispatch();
  const [importFile, setImportFile] = useState<File>();
  const importDialogProps = useImport(importFile);
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
      <PageCreateEditDialog {...pageCreateDialog.binding} />
      <ConfirmationDialog
        {...pagesDeleteDialog.binding}
        dialogTitle="Delete pages confirmation"
        dialogMessage="Do you really want to delete all selected pages?"
      />
      <ConfirmationDialog
        {...importDialogProps}
        dialogTitle="Import warning"
        dialogMessage={importWarningMessage}
      />
      {selectedPageIds.length > 0 ? (
        <React.Fragment>
          <Typography className={classes.title}>{selectedPageIds.length} selected</Typography>
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
          <Typography variant="h1" className={classes.title} role="heading">
            Pages
          </Typography>
          <Tooltip title="Add new page">
            <span>
              <IconButton onClick={handleAddClick} size="large">
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
                size="large"
              >
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Import pages">
            {/* TODO: move this part with file change handler to reusable component */}
            <label>
              <IconButton component="span" size="large">
                <PublishIcon />
              </IconButton>
              <input
                aria-label="Import file"
                type="file"
                name="importFile"
                hidden
                onChange={handleImportFileChange}
              />
            </label>
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
        <PagesFilter />
      </Popover>
      {children}
    </Toolbar>
  );
};

export default PagesToolbar;
