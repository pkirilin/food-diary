import { List, ListSubheader, Stack, Typography } from '@mui/material';
import { useMemo, type FC } from 'react';
import { getMealName, type MealType, type NoteItem } from '../models';
import { NotesListItem } from './NotesListItem';

interface Props {
  pageId: number;
  mealType: MealType;
  notes: NoteItem[];
}

export const NotesList: FC<Props> = ({ pageId, mealType, notes }) => {
  const mealName = useMemo(() => getMealName(mealType), [mealType]);
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

  return (
    <List
      subheader={
        <ListSubheader>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Typography
              fontSize="inherit"
              fontWeight="inherit"
              lineHeight="inherit"
              component="span"
              noWrap
            >
              {mealName}
            </Typography>
            <Typography
              fontSize="inherit"
              fontWeight="inherit"
              lineHeight="inherit"
              component="span"
              width={100}
              align="right"
            >
              {totalCalories} kcal
            </Typography>
          </Stack>
        </ListSubheader>
      }
      sx={{ width: '100%' }}
    >
      {notes.map(note => (
        <NotesListItem key={note.id} note={note} pageId={pageId} />
      ))}
    </List>
  );
};
