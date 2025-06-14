import { ListItem, Stack, Typography, Card, CardContent, CardActions } from '@mui/material';
import { type FC } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { NutritionComponentLabel } from '@/entities/product';
import { AddNoteButton } from '@/features/manageNote';
import { NotesList } from './NotesList';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

export const MealsListItem: FC<Props> = ({ date, mealType }) => {
  const mealCalories = noteLib.useMealCalories(date, mealType);
  const mealName = noteLib.getMealName(mealType);

  return (
    <ListItem
      disableGutters
      disablePadding
      aria-label={`${mealName}, ${mealCalories} kilocalories`}
    >
      <Stack width="100%">
        <Card sx={{ minWidth: '100%' }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={1}
            p={2}
            bgcolor={theme => theme.palette.grey[100]}
          >
            <Typography fontWeight="bold">{mealName}</Typography>
            <NutritionComponentLabel type="calories" value={mealCalories} size="medium" bold />
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
