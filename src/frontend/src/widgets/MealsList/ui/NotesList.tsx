import { ButtonGroup, List, ListItem } from '@mui/material';
import { type FC } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { AddNote, AddNoteByPhoto } from '@/features/note/addEdit';
import { NotesListItem } from './NotesListItem';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  notes: noteModel.NoteItem[];
}

export const NotesList: FC<Props> = ({ pageId, mealType, notes }) => {
  const nextDisplayOrder = noteLib.useNextDisplayOrder(pageId);

  return (
    <List disablePadding>
      {notes.map(note => (
        <NotesListItem key={note.id} note={note} pageId={pageId} />
      ))}
      <ListItem disableGutters>
        <ButtonGroup variant="text" sx={{ width: '100%' }}>
          <AddNote pageId={pageId} mealType={mealType} displayOrder={nextDisplayOrder} />
          <AddNoteByPhoto pageId={pageId} mealType={mealType} displayOrder={nextDisplayOrder} />
        </ButtonGroup>
      </ListItem>
    </List>
  );
};
