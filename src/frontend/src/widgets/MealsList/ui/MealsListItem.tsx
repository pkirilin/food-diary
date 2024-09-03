import { Box, ListItem, Paper } from '@mui/material';
import { type FC } from 'react';
import { type NoteItem, noteLib, type noteModel } from '@/entities/note';
import { MealsListItemHeader } from './MealsListItemHeader';
import { NotesList } from './NotesList';

interface Props {
  date: string;
  mealType: noteModel.MealType;
  notes: NoteItem[];
}

export const MealsListItem: FC<Props> = ({ date, mealType, notes }) => {
  const totalCalories = noteLib.useCalories(notes);

  return (
    <ListItem disableGutters disablePadding>
      <Box width="100%">
        <MealsListItemHeader
          mealName={noteLib.getMealName(mealType)}
          totalCalories={totalCalories}
        />
        <Paper component="section">
          <NotesList date={date} mealType={mealType} notes={notes} />
        </Paper>
      </Box>
    </ListItem>
  );
};
