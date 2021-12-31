import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTypedSelector } from '../../__shared__/hooks';

const MealsListSummary: React.FC = () => {
  const totalCalories = useTypedSelector(state =>
    state.notes.noteItems.reduce((sum, note) => sum + note.calories, 0),
  );

  return (
    <Typography variant="h2" component={Box}>
      Total calories: {totalCalories}
    </Typography>
  );
};

export default MealsListSummary;
