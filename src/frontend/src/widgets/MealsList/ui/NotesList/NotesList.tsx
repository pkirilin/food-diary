import { List } from '@mui/material';
import { type FC } from 'react';
import { noteApi, type noteModel } from '@/entities/note';
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

  return (
    <List disablePadding>
      {notes.map(note => (
        <NotesListItem key={note.id} note={note} />
      ))}
    </List>
  );
};
