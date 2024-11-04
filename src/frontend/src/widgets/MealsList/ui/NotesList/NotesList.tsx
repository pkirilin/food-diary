import { List, ListItem } from '@mui/material';
import { type FC } from 'react';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { AddNoteButton } from '@/features/addNote';
import { NotesListItem } from './NotesListItem';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const NotesList: FC<Props> = ({ date, mealType }) => {
  const { notes } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data, isSuccess }) => ({ notes: isSuccess ? data[mealType] : [] }),
    },
  );

  const displayOrder = noteLib.useNextDisplayOrder(notes);

  return (
    <List disablePadding>
      {notes.map(note => (
        <NotesListItem key={note.id} note={note} />
      ))}
      <ListItem disableGutters>
        <AddNoteButton date={date} mealType={mealType} displayOrder={displayOrder} />
      </ListItem>
    </List>
  );
};
