import { Box, ListItem, Paper } from '@mui/material';
import { useMemo, type FC } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { MealsListItemHeader } from './MealsListItemHeader';
import { NotesList } from './NotesList';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  notes: noteModel.NoteItem[];
}

export const MealsListItem: FC<Props> = ({ pageId, mealType, notes }) => {
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

  return (
    <ListItem disableGutters disablePadding>
      <Box width="100%">
        <MealsListItemHeader
          mealName={noteLib.getMealName(mealType)}
          totalCalories={totalCalories}
        />
        <Paper component="section">
          <NotesList pageId={pageId} mealType={mealType} notes={notes} />
        </Paper>
      </Box>
    </ListItem>
  );
};
