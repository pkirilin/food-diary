import PublishIcon from '@mui/icons-material/Publish';
import { MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { type PropsWithChildren, type FC, useState, type ChangeEvent } from 'react';
import { useImport } from '../hooks/useImport';
import { usePages } from '../model';
import ConfirmImportDialog from './ConfirmImportDialog';

interface ImportPagesMenuItemProps {
  isDisabled: boolean;
  onMenuClose: () => void;
}

const ImportPagesMenuItem: FC<PropsWithChildren<ImportPagesMenuItemProps>> = ({
  children,
  isDisabled,
  onMenuClose,
}) => {
  const [importFile, setImportFile] = useState<File>();
  const pages = usePages();

  const importPages = useImport({
    file: importFile,
    pagesChanged: pages.isChanged,
  });

  const cleanFileInput = (target: EventTarget & HTMLInputElement): void => {
    // Change handler will not be executed if file with the same name is uploaded multiple times
    target.value = '';
  };

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
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
    <>
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
      <ConfirmImportDialog
        isOpened={importPages.isDialogOpened}
        submitInProgress={importPages.isLoading || pages.isFetching}
        onClose={importPages.closeDialog}
        onSubmit={importPages.start}
      />
    </>
  );
};

export default ImportPagesMenuItem;
