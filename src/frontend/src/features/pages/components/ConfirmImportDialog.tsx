import { Typography } from '@mui/material';
import { FC } from 'react';
import { AppButton, AppDialog } from 'src/components';

const WARNING_MESSAGE =
  'Pages import is going to be started. Import may update or overwrite existing data from file and may cause data loss. Continue?';

type ConfirmImportDialogProps = {
  isOpened: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const ConfirmImportDialog: FC<ConfirmImportDialogProps> = ({
  isOpened,
  isLoading,
  onClose,
  onSubmit,
}) => {
  return (
    <AppDialog
      title="Import warning"
      isOpened={isOpened}
      content={<Typography>{WARNING_MESSAGE}</Typography>}
      actionSubmit={
        <AppButton variant="contained" color="primary" onClick={onSubmit} isLoading={isLoading}>
          Yes
        </AppButton>
      }
      actionCancel={
        <AppButton variant="text" onClick={onClose} isLoading={isLoading}>
          No
        </AppButton>
      }
      onClose={onClose}
    />
  );
};

export default ConfirmImportDialog;
