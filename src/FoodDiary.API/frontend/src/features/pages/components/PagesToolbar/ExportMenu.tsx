import { Fragment } from 'react';
import { useDispatch } from 'react-redux';

import { IconButton, List, ListItem, ListSubheader, Popover, Tooltip } from '@material-ui/core';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import { useDialog, usePopover } from 'src/features/__shared__/hooks';
import { exportPages, ExportPagesRequest } from 'src/features/pages/thunks';

import ExportDialog from './ExportDialog';

export default function ExportMenu() {
  const [exportOptions, showExportOptions] = usePopover();
  const dispatch = useDispatch();

  const { binding: exportDialogProps, show: showExportDialog } = useDialog<ExportPagesRequest>(
    exportParams => {
      dispatch(exportPages(exportParams));
    },
  );

  return (
    <Fragment>
      <ExportDialog {...exportDialogProps}></ExportDialog>
      <Tooltip title="Export pages">
        <span>
          <IconButton onClick={event => showExportOptions(event)}>
            <CloudDownloadIcon />
          </IconButton>
        </span>
      </Tooltip>
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
          <ListItem button onClick={() => showExportDialog()}>
            Export by filter parameters
          </ListItem>
        </List>
      </Popover>
    </Fragment>
  );
}
