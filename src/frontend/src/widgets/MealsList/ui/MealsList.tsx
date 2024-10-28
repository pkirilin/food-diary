import { List, Stack } from '@mui/material';
import { type FC, type PropsWithChildren } from 'react';
import { noteLib } from '@/entities/note';
import { MealsListItem } from './MealsListItem';

interface Props extends PropsWithChildren {
  date: string;
}

const MEAL_TYPES = noteLib.getMealTypes();

export const MealsList: FC<Props> = ({ date }: Props) => (
  <Stack spacing={4} component={List} disablePadding>
    {MEAL_TYPES.map(mealType => (
      <MealsListItem key={mealType} date={date} mealType={mealType} />
    ))}
  </Stack>
);
