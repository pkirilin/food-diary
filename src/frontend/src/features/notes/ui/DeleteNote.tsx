import { type ReactElement, type FC, useEffect } from 'react';
import { useToggle } from '@/shared/hooks';
import { notesApi } from '../api';
import { useNotes } from '../model';
import { type NoteItem } from '../models';
import { DeleteNoteDialog } from './DeleteNoteDialog';

interface Props {
  children: (toggleDialog: () => void) => ReactElement;
  note: NoteItem;
  pageId: number;
}

export const DeleteNote: FC<Props> = ({ children, note, pageId }) => {
  const notes = useNotes(pageId);
  const [deleteNote, deleteNoteResponse] = notesApi.useDeleteNoteMutation();
  const [dialogOpened, toggleDialog] = useToggle();

  useEffect(() => {
    if (deleteNoteResponse.isSuccess && notes.isChanged) {
      toggleDialog();
    }
  }, [deleteNoteResponse.isSuccess, notes.isChanged, toggleDialog]);

  const handleSubmit = ({ id }: NoteItem): void => {
    void deleteNote(id);
  };

  return (
    <>
      {children(toggleDialog)}
      <DeleteNoteDialog
        note={note}
        isOpened={dialogOpened}
        submitInProgress={deleteNoteResponse.isLoading || notes.isFetching}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
      />
    </>
  );
};
