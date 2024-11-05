import { Typography } from '@mui/material';
import { type FC } from 'react';
import { noteApi, noteModel } from '@/entities/note';

interface Props {
  date: string;
}

export const MealsListTotalCalories: FC<Props> = ({ date }) => {
  const { totalCalories } = noteApi.useNotesQuery(
    { date },
    {
      selectFromResult: ({ data, isSuccess }) => ({
        totalCalories: isSuccess ? noteModel.querySelectors.totalCalories(data) : 0,
      }),
    },
  );

  return (
    <Typography variant="h6" component="span">
      {totalCalories} kcal
    </Typography>
  );
};
