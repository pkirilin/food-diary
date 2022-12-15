import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import { ExportFormat } from '../models';
import ExportDialog from './ExportDialog';

type ExportPagesMenuItemProps = {
  format: ExportFormat;
  icon: React.ReactElement;
  onMenuClose: () => void;
};

const ExportPagesMenuItem: React.FC<React.PropsWithChildren<ExportPagesMenuItemProps>> = ({
  children,
  format,
  icon,
  onMenuClose,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleExport() {
    onMenuClose();
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
  }

  return (
    <React.Fragment>
      <ExportDialog format={format} isOpen={isDialogOpen} onClose={handleDialogClose} />
      <MenuItem onClick={handleExport}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText>{children}</ListItemText>
      </MenuItem>
    </React.Fragment>
  );
};

export default ExportPagesMenuItem;
