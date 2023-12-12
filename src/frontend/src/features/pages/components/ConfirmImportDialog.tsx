import { Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { AppButton, AppDialog } from 'src/components';

const WARNING_MESSAGE =
  'Pages import is going to be started. Import may update or overwrite existing data from file and may cause data loss. Continue?';

interface ConfirmImportDialogProps {
  isOpened: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const ConfirmImportDialog: FC<ConfirmImportDialogProps> = ({
  isOpened,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <AppDialog
      title="Import warning"
      isOpened={isOpened}
      content={
        <form id="confirm-import" onSubmit={handleSubmit}>
          <Typography>{WARNING_MESSAGE}</Typography>
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="confirm-import"
          variant="contained"
          color="error"
          isLoading={isLoading}
          autoFocus
        >
          Yes
        </AppButton>
      }
      actionCancel={
        <AppButton
          type="button"
          variant="text"
          color="inherit"
          onClick={onClose}
          isLoading={isLoading}
        >
          No
        </AppButton>
      }
      onClose={onClose}
    />
  );
};

export default ConfirmImportDialog;
