import { type ReactElement, type FC, useEffect } from 'react';
import { type NoteItem, noteApi, noteLib } from '@/entities/note';
import { useToggle } from '@/shared/hooks';
import { DeleteNoteDialog } from './DeleteNoteDialog';

interface Props {
  note: NoteItem;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const DeleteNote: FC<Props> = ({ note, renderTrigger }) => {
  const notes = noteLib.useNotes(note.date);
  const [deleteNote, deleteNoteResponse] = noteApi.useDeleteNoteMutation();
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
