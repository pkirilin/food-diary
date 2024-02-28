import { Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { Button } from '@/shared/ui';
import { AppDialog } from 'src/components';

interface DeletePagesDialogProps {
  isOpened: boolean;
  submitInProgress: boolean;
  pageIds: number[];
  onClose: () => void;
  onSubmit: (pageIds: number[]) => void;
}

const DeletePagesDialog: FC<DeletePagesDialogProps> = ({
  isOpened,
  submitInProgress,
  pageIds,
  onClose,
  onSubmit,
}) => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit(pageIds);
  };

  return (
    <AppDialog
      title="Delete pages confirmation"
      isOpened={isOpened}
      content={
        <form id="delete-pages" onSubmit={handleSubmit}>
          <Typography>Do you really want to delete all selected pages?</Typography>
        </form>
      }
      actionSubmit={
        <Button
          type="submit"
          form="delete-pages"
          variant="text"
          color="error"
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

export default DeletePagesDialog;
