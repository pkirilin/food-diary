import { Box, ListItem, Paper } from '@mui/material';
import { type FC } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { MealsListItemHeader } from './MealsListItemHeader';
import { NotesList } from './NotesList';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const MealsListItem: FC<Props> = ({ date, mealType }) => (
  <ListItem disableGutters disablePadding>
    <Box
      sx={{
        width: '100%',
      }}
    >
      <MealsListItemHeader mealName={noteLib.getMealName(mealType)} />
      <Paper component="section">
        <NotesList date={date} mealType={mealType} />
      </Paper>
    </Box>
  </ListItem>
);
