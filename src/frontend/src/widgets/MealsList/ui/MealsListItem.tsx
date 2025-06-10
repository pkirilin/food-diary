import { ListItem, Stack, Typography, Card, CardContent, CardActions } from '@mui/material';
import { type FC } from 'react';
import { noteApi, noteLib, noteModel } from '@/entities/note';
import { NutritionComponentLabel } from '@/entities/product';
import { AddNoteButton } from '@/features/manageNote';
import { NotesList } from './NotesList';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const MealsListItem: FC<Props> = ({ date, mealType }) => {
  const { totalCalories } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data, isSuccess }) => ({
        totalCalories: isSuccess ? noteModel.querySelectors.totalCaloriesByMeal(data, mealType) : 0,
      }),
    },
  );

  const mealName = noteLib.getMealName(mealType);

  return (
    <ListItem
      disableGutters
      disablePadding
      aria-label={`${mealName}, ${totalCalories} kilocalories`}
    >
      <Stack width="100%">
        <Stack direction="row" justifyContent="space-between" spacing={1} p={2}>
          <Typography fontWeight="bold">{mealName}</Typography>
          <NutritionComponentLabel
            nutritionComponentType="calories"
            value={totalCalories}
            size="medium"
            bold
          />
        </Stack>
        <Card sx={{ minWidth: '100%' }}>
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
