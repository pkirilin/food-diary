import { type ReactElement, type FC, useEffect } from 'react';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { useToggle } from '@/shared/hooks';
import { DeleteNoteDialog } from './DeleteNoteDialog';

interface Props {
  note: noteModel.NoteItem;
  pageId: number;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const DeleteNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
  const notes = noteLib.useNotes(pageId);
  const [deleteNote, deleteNoteResponse] = noteApi.useDeleteNoteMutation();
  const [dialogOpened, toggleDialog] = useToggle();

  useEffect(() => {
    if (deleteNoteResponse.isSuccess && notes.isChanged) {
      toggleDialog();
    }
  }, [deleteNoteResponse.isSuccess, notes.isChanged, toggleDialog]);

  const handleSubmit = ({ id }: noteModel.NoteItem): void => {
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
