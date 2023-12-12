import { Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { AppButton, AppDialog } from 'src/components';

interface DeletePagesDialogProps {
  isOpened: boolean;
  isLoading: boolean;
  pageIds: number[];
  onClose: () => void;
  onSubmit: (pageIds: number[]) => void;
}

const DeletePagesDialog: FC<DeletePagesDialogProps> = ({
  isOpened,
  isLoading,
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
        <AppButton
          type="submit"
          form="delete-pages"
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

export default DeletePagesDialog;
