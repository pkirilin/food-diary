import { List, ListItem } from '@mui/material';
import { useMemo, type FC } from 'react';
import { type MealType, type NoteItem } from '../../models';
import { AddNote } from '../AddNote';
import { NotesListItem } from './NotesListItem';

interface Props {
  pageId: number;
  mealType: MealType;
  notes: NoteItem[];
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
      <ListItem>
        <AddNote
          pageId={pageId}
          mealType={mealType}
          displayOrder={maxDisplayOrderForNotesGroup + 1}
        />
      </ListItem>
    </List>
  );
};
