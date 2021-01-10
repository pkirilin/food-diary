import React from 'react';
import { Box, Typography } from '@material-ui/core';

const totalCalories = 1200;

const MealsListSummary: React.FC = () => {
  return (
    <Typography variant="h2" component={Box}>
      Total calories: {totalCalories}
    </Typography>
  );
};

export default MealsListSummary;
