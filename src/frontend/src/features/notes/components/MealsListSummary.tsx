import { Box, Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '../../__shared__/hooks';

const MealsListSummary: FC = () => {
  const totalCalories = useAppSelector(state =>
    state.notes.noteItems.reduce((sum, note) => sum + note.calories, 0),
  );

  return (
    <Typography variant="h2" component={Box}>
      Total calories: {totalCalories}
    </Typography>
  );
};

export default MealsListSummary;
