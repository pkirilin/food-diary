import { ListItem, Stack, Typography, Card, CardContent, CardActions } from '@mui/material';
import { type FC } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { NutritionValueDisplay } from '@/entities/product';
import { AddNoteButton } from '@/features/manageNote';
import { NotesList } from './NotesList';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const MealsListItem: FC<Props> = ({ date, mealType }) => {
  const { calories, protein, fats, carbs, sugar, salt } = noteLib.useNutritionValues(
    date,
    mealType,
  );

  const mealName = noteLib.getMealName(mealType);

  return (
    <ListItem disableGutters disablePadding aria-label={`${mealName}, ${calories} kilocalories`}>
      <Stack width="100%">
        <Card sx={{ minWidth: '100%' }}>
          <Stack direction="column" p={2} spacing={1} bgcolor={theme => theme.palette.grey[100]}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">{mealName}</Typography>
              <NutritionValueDisplay type="calories" size="small" value={calories} bold />
            </Stack>
            <Stack direction="row" spacing={2} py={1} overflow="scroll">
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
