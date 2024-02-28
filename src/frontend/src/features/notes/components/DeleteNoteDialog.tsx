import { Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { Button } from '@/shared/ui';
import { AppDialog } from 'src/components';
import { type NoteItem } from '../models';

interface DeleteNoteDialogProps {
  note: NoteItem;
  isOpened: boolean;
  submitInProgress: boolean;
  onClose: () => void;
  onSubmit: (note: NoteItem) => void;
}

const DeleteNoteDialog: FC<DeleteNoteDialogProps> = ({
  note,
  isOpened,
  submitInProgress,
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
        <Button
          type="submit"
          form="delete-note"
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

export default DeleteNoteDialog;
