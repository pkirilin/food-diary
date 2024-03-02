import { Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { Button } from '@/shared/ui';
import { AppDialog } from 'src/components';

const WARNING_MESSAGE =
  'Pages import is going to be started. Import may update or overwrite existing data from file and may cause data loss. Continue?';

interface ConfirmImportDialogProps {
  isOpened: boolean;
  submitInProgress: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const ConfirmImportDialog: FC<ConfirmImportDialogProps> = ({
  isOpened,
  submitInProgress,
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
        <Button
          type="submit"
          form="confirm-import"
          variant="text"
          color="warning"
          loading={submitInProgress}
          autoFocus
        >
          Yes
        </Button>
      }
      actionCancel={
        <Button
          type="button"
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={submitInProgress}
        >
          No
        </Button>
      }
      onClose={onClose}
    />
  );
};

export default ConfirmImportDialog;
