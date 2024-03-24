import { Box, ListItem, Paper } from '@mui/material';
import { useMemo, type FC } from 'react';
import { getMealName, type MealType, type NoteItem } from '../../models';
import { NotesList } from '../NotesList';
import { MealsListItemHeader } from './MealsListItemHeader';

interface Props {
  pageId: number;
  mealType: MealType;
  notes: NoteItem[];
}

export const MealsListItem: FC<Props> = ({ pageId, mealType, notes }) => {
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

  return (
    <ListItem disableGutters disablePadding>
      <Box width="100%">
        <MealsListItemHeader mealName={getMealName(mealType)} totalCalories={totalCalories} />
        <Paper component="section">
          <NotesList pageId={pageId} mealType={mealType} notes={notes} />
        </Paper>
      </Box>
    </ListItem>
  );
};
