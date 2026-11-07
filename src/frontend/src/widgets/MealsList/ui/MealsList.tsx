import { List, Stack } from '@mui/material';
import { type FC } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { MealsListItem } from './MealsListItem';

interface Props {
  date: string;
  onOpenLogFood: (mealType: noteModel.MealType) => void;
}

const MEAL_TYPES = noteLib.getMealTypes();

export const MealsList: FC<Props> = ({ date, onOpenLogFood }) => (
  <Stack spacing={4} component={List} disablePadding>
    {MEAL_TYPES.map(mealType => (
      <MealsListItem key={mealType} date={date} mealType={mealType} onOpenLogFood={onOpenLogFood} />
    ))}
  </Stack>
);
