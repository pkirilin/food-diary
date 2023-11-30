import { Typography } from '@mui/material';
import { type FC } from 'react';
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
  const handleSubmit = (): void => {
    onSubmit(note);
  };

  return (
    <AppDialog
      title="Delete note confirmation"
      isOpened={isOpened}
      content={
        <Typography>{`Are you sure you want to delete this note: ${note.productName}, ${note.productQuantity} g, ${note.calories} cal?`}</Typography>
      }
      actionSubmit={
        <AppButton variant="contained" color="primary" onClick={handleSubmit} isLoading={isLoading}>
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

export default DeleteNoteDialog;
