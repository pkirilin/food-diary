import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { IconButton, List, ListItem, Popover, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { usePopover } from 'src/features/__shared__/hooks';
import { ExportFormat } from '../../models';
import ExportDialog from './ExportDialog';

const ExportMenu: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [menuProps, showMenu] = usePopover();

  function openExportDialog(format: ExportFormat) {
    setExportFormat(format);
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
  }

  return (
    <React.Fragment>
      <ExportDialog format={exportFormat} isOpen={isDialogOpen} onClose={handleDialogClose} />
      <Tooltip title="Export pages">
        <span>
          <IconButton onClick={event => showMenu(event)} size="large">
            <CloudDownloadIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Popover
        {...menuProps}
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
        <List>
          <ListItem button onClick={() => openExportDialog('json')}>
            Export to JSON
          </ListItem>
          <ListItem button onClick={() => openExportDialog('google docs')}>
            Export to Google Docs
          </ListItem>
        </List>
      </Popover>
    </React.Fragment>
  );
};

export default ExportMenu;
