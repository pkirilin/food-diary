import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useState, type PropsWithChildren, type FC, type ReactElement } from 'react';
import { type ExportFormat } from '../models';
import ExportDialog from './ExportDialog';

interface ExportPagesMenuItemProps {
  format: ExportFormat;
  icon: ReactElement;
  isDisabled: boolean;
  onMenuClose: () => void;
}

const ExportPagesMenuItem: FC<PropsWithChildren<ExportPagesMenuItemProps>> = ({
  children,
  format,
  icon,
  isDisabled,
  onMenuClose,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = (): void => {
    onMenuClose();
    setIsDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <ExportDialog format={format} isOpen={isDialogOpen} onClose={handleDialogClose} />
      <MenuItem disabled={isDisabled} onClick={handleExport}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText>{children}</ListItemText>
      </MenuItem>
    </>
  );
};

export default ExportPagesMenuItem;
