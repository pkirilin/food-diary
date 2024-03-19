import { DialogContentText, Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { Button } from '@/shared/ui';
import { AppDialog } from 'src/components';
import { getMealName, type NoteItem } from '../models';

interface DeleteNoteDialogProps {
  note: NoteItem;
  isOpened: boolean;
  submitInProgress: boolean;
  onClose: () => void;
  onSubmit: (note: NoteItem) => void;
}

export const DeleteNoteDialog: FC<DeleteNoteDialogProps> = ({
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
      title="Delete note?"
      isOpened={isOpened}
      content={
        <form id="delete-note" onSubmit={handleSubmit}>
          <DialogContentText paragraph>
            You are going to delete this note from <b>{getMealName(note.mealType)}</b>:
          </DialogContentText>
          <Typography>
            {note.productName} {note.productQuantity} g ({note.calories} cal)
          </Typography>
          <DialogContentText />
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
          Delete
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
          Cancel
        </Button>
      }
      onClose={onClose}
    />
  );
};
