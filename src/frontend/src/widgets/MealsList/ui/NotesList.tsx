import { List, ListItem } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { noteLib, type noteModel } from '@/entities/note';
import { AddNoteButton } from '@/features/addNote';
import { AddNote } from '@/features/note/addEdit';
import { NotesListItem } from './NotesListItem';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const NotesList: FC<Props> = ({ date, mealType }) => {
  const notes = useAppSelector(state => state.notes.byMealType[mealType]);
  const displayOrder = noteLib.useNextDisplayOrder(notes);

  return (
    <List disablePadding>
      {notes.map(note => (
        <NotesListItem key={note.id} note={note} />
      ))}
      <ListItem disableGutters>
        <AddNote date={date} mealType={mealType} displayOrder={displayOrder} />
      </ListItem>
      <ListItem disableGutters>
        <AddNoteButton date={date} mealType={mealType} displayOrder={displayOrder} />
      </ListItem>
    </List>
  );
};
