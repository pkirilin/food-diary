import { Fragment, useState } from 'react';
import { IconButton, List, ListItem, ListSubheader, Popover, Tooltip } from '@material-ui/core';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import { usePopover } from 'src/features/__shared__/hooks';
import ExportDialog from './ExportDialog';

export default function ExportMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  const [menuProps, showMenu] = usePopover();

  return (
    <Fragment>
      <ExportDialog isOpen={isDialogOpen} onClose={handleDialogClose}></ExportDialog>
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
        <List subheader={<ListSubheader>Export pages</ListSubheader>}>
          <ListItem button onClick={handleDialogOpen}>
            Export by filter parameters
          </ListItem>
        </List>
      </Popover>
    </Fragment>
  );
}
