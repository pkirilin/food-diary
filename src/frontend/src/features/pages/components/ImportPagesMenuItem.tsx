import PublishIcon from '@mui/icons-material/Publish';
import { MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import React, { useState } from 'react';
import { ConfirmationDialog } from 'src/components';
import { useImport } from '../hooks/useImport';

type ImportPagesMenuItemProps = {
  isDisabled: boolean;
  onMenuClose: () => void;
};

const ImportPagesMenuItem: React.FC<React.PropsWithChildren<ImportPagesMenuItemProps>> = ({
  children,
  isDisabled,
  onMenuClose,
}) => {
  const [importFile, setImportFile] = useState<File>();
  const importDialogProps = useImport(importFile);

  function cleanFileInput(target: EventTarget & HTMLInputElement) {
    // Change handler will not be executed if file with the same name is uploaded multiple times
    if (target) {
      target.value = '';
    }
  }

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    try {
      const file = event.target.files?.item(0);
      if (file) {
        setImportFile(file);
      }
    } finally {
      cleanFileInput(event.target);
    }
  };

  return (
    <React.Fragment>
      <MenuItem disabled={isDisabled} onClick={onMenuClose}>
        <Box
          component="label"
          display="inherit"
          width="100%"
          sx={theme => ({
            [theme.breakpoints.up('lg')]: {
              '&:hover': {
                cursor: 'pointer',
              },
            },
          })}
        >
          <ListItemIcon>
            <PublishIcon />
          </ListItemIcon>
          <ListItemText>{children}</ListItemText>
          <input
            aria-label="Import file"
            type="file"
            name="importFile"
            hidden
            onChange={handleImportFileChange}
          />
        </Box>
      </MenuItem>
      <ConfirmationDialog
        {...importDialogProps}
        dialogTitle="Import warning"
        dialogMessage={
          'Pages import is going to be started. Import may update or overwrite existing data from file and may cause data loss. Continue?'
        }
      />
    </React.Fragment>
  );
};

export default ImportPagesMenuItem;
