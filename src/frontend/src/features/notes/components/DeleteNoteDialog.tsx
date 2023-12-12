import { Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { AppButton, AppDialog } from 'src/components';
import { type NoteItem } from '../models';

interface DeleteNoteDialogProps {
  note: NoteItem;
  isOpened: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (note: NoteItem) => void;
}

const DeleteNoteDialog: FC<DeleteNoteDialogProps> = ({
  note,
  isOpened,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit(note);
  };

  return (
    <AppDialog
      title="Delete note confirmation"
      isOpened={isOpened}
      content={
        <form id="delete-note" onSubmit={handleSubmit}>
          <Typography>{`Are you sure you want to delete this note: ${note.productName}, ${note.productQuantity} g, ${note.calories} cal?`}</Typography>
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="delete-note"
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

export default DeleteNoteDialog;
