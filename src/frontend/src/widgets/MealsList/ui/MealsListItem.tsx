import { ListItem, Stack, Typography, Card, CardContent, CardActions, Badge } from '@mui/material';
import { type FC } from 'react';
import { noteLib, noteModel } from '@/entities/note';
import { NutritionValueDisplay } from '@/entities/product';
import { AddNoteButton } from '@/features/manageNote';
import { NotesList } from './NotesList';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const MealsListItem: FC<Props> = ({ date, mealType }) => {
  const mealName = noteLib.getMealName(mealType);
  const { data: notes } = noteLib.useNotes(date, mealType);
  const { calories, protein, fats, carbs, sugar, salt } = noteModel.calculateNutritionValues(notes);
  const hasNutritionalValues = notes.every(noteModel.hasNutritionalValues);

  return (
    <ListItem disableGutters disablePadding aria-label={`${mealName}, ${calories} kilocalories`}>
      <Stack width="100%">
        <Card sx={{ minWidth: '100%' }}>
          <Stack direction="column" p={2} spacing={2} bgcolor={theme => theme.palette.grey[100]}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight="bold">{mealName}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {!hasNutritionalValues && <Badge color="warning" variant="dot" />}
                <NutritionValueDisplay type="calories" size="medium" value={calories} bold />
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2} py={1} overflow={['auto', 'hidden']}>
              <NutritionValueDisplay type="protein" size="small" value={protein} bold />
              <NutritionValueDisplay type="fats" size="small" value={fats} bold />
              <NutritionValueDisplay type="carbs" size="small" value={carbs} bold />
              <NutritionValueDisplay type="sugar" size="small" value={sugar} bold />
              <NutritionValueDisplay type="salt" size="small" value={salt} bold />
            </Stack>
          </Stack>
          <CardContent sx={{ padding: 0 }}>
            <NotesList date={date} mealType={mealType} />
          </CardContent>
          <CardActions>
            <AddNoteButton date={date} mealType={mealType} />
          </CardActions>
        </Card>
      </Stack>
    </ListItem>
  );
};
