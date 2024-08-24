import { List, ListItem } from '@mui/material';
import { type FC } from 'react';
import { type NoteItem, type noteModel } from '@/entities/note';
import { AddNote } from '@/features/note/addEdit';
import { NotesListItem } from './NotesListItem';

interface Props {
  date: string;
  mealType: noteModel.MealType;
  notes: NoteItem[];
}

export const NotesList: FC<Props> = ({ date, mealType, notes }) => (
  <List disablePadding>
    {notes.map(note => (
      <NotesListItem key={note.id} note={note} />
    ))}
    <ListItem disableGutters>
      <AddNote date={date} mealType={mealType} />
    </ListItem>
  </List>
);
