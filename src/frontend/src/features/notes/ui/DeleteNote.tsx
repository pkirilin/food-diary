import { type ReactElement, type FC, useEffect } from 'react';
import { useToggle } from '@/shared/hooks';
import { notesApi } from '../api';
import { useNotes } from '../model';
import { type NoteItem } from '../models';
import { DeleteNoteDialog } from './DeleteNoteDialog';

interface Props {
  note: NoteItem;
  pageId: number;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const DeleteNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
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
      {renderTrigger(toggleDialog)}
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
