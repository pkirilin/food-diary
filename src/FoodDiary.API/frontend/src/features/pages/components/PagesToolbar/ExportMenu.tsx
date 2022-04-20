import { Fragment, useState } from 'react';
import { IconButton, List, ListItem, Popover, Tooltip } from '@material-ui/core';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import { usePopover } from 'src/features/__shared__/hooks';
import ExportDialog from './ExportDialog';
import { ExportFormat } from '../../models';

export default function ExportMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [menuProps, showMenu] = usePopover();

  function openExportDialog(format: ExportFormat) {
    setExportFormat(format);
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    return setIsDialogOpen(false);
  }

  return (
    <Fragment>
      <ExportDialog
        format={exportFormat}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
      ></ExportDialog>
      <Tooltip title="Export pages">
        <span>
          <IconButton onClick={event => showMenu(event)}>
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
    </Fragment>
  );
}
