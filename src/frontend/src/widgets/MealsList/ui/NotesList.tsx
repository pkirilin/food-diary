import { List, ListItem } from '@mui/material';
import { type FC } from 'react';
import { type noteModel } from '@/entities/note';
import { AddNote } from '@/features/note/addEdit';
import { NotesListItem } from './NotesListItem';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  notes: noteModel.NoteItem[];
}

export const NotesList: FC<Props> = ({ pageId, mealType, notes }) => (
  <List disablePadding>
    {notes.map(note => (
      <NotesListItem key={note.id} note={note} pageId={pageId} />
    ))}
    <ListItem disableGutters>
      <AddNote pageId={pageId} mealType={mealType} />
    </ListItem>
  </List>
);
