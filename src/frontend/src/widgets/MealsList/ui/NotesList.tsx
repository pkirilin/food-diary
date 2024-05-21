import { ButtonGroup, List, ListItem } from '@mui/material';
import { useMemo, type FC } from 'react';
import { type noteModel } from '@/entities/note';
import { AddNote, AddNoteByPhoto } from '@/features/note/addEdit';
import { NotesListItem } from './NotesListItem';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  notes: noteModel.NoteItem[];
}

export const NotesList: FC<Props> = ({ pageId, mealType, notes }) => {
  const maxDisplayOrderForNotesGroup = useMemo(
    () =>
      notes.reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ),
    [notes],
  );

  return (
    <List disablePadding>
      {notes.map(note => (
        <NotesListItem key={note.id} note={note} pageId={pageId} />
      ))}
      <ListItem disableGutters>
        <ButtonGroup variant="text" sx={{ width: '100%' }}>
          <AddNote
            pageId={pageId}
            mealType={mealType}
            displayOrder={maxDisplayOrderForNotesGroup + 1}
          />
          <AddNoteByPhoto pageId={pageId} />
        </ButtonGroup>
      </ListItem>
    </List>
  );
};
