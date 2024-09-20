import { Typography } from '@mui/material';
import { type FC } from 'react';
import { noteLib } from '@/entities/note';

interface Props {
  date: string;
}

export const MealsListTotalCalories: FC<Props> = ({ date }) => {
  const notes = noteLib.useNotes(date);
  const totalCalories = noteLib.useCalories(notes.data);

  return (
    <Typography variant="h6" component="span">
      {totalCalories} kcal
    </Typography>
  );
};
