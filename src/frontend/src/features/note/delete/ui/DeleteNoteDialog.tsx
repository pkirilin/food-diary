import { DialogContentText, Typography } from '@mui/material';
import { type FormEventHandler, type FC } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { Button, AppDialog } from '@/shared/ui';

interface DeleteNoteDialogProps {
  note: noteModel.NoteItem;
  isOpened: boolean;
  submitInProgress: boolean;
  onClose: () => void;
  onSubmit: (note: noteModel.NoteItem) => void;
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
            You are going to delete this note from <b>{noteLib.getMealName(note.mealType)}</b>:
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
