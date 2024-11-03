import { Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { noteModel } from '@/entities/note';

export const MealsListTotalCalories: FC = () => {
  const totalCalories = useAppSelector(noteModel.selectors.totalCalories);

  return (
    <Typography variant="h6" component="span">
      {totalCalories} kcal
    </Typography>
  );
};
