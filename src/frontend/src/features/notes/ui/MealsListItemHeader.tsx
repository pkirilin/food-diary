import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';

interface Props {
  mealName: string;
  totalCalories: number;
}

export const MealsListItemHeader: FC<Props> = ({ mealName, totalCalories }) => (
  <Stack direction="row" spacing={2} justifyContent="space-between" mt={2} mb={3}>
    <Typography variant="body1" component="h2" fontWeight="bold">
      {mealName}
    </Typography>
    <Typography
      variant="body1"
      component="span"
      fontWeight="bold"
    >{`${totalCalories} kcal`}</Typography>
  </Stack>
);
