import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';

interface Props {
  mealName: string;
  totalCalories: number;
}

export const MealsListItemHeader: FC<Props> = ({ mealName, totalCalories }) => (
  <Stack direction="row" spacing={2} justifyContent="space-between" mt={2} mb={3}>
    <Typography
      variant="body1"
      component="h2"
      sx={theme => ({
        fontWeight: theme.typography.fontWeightBold,
        color: theme.palette.text.secondary,
      })}
    >
      {mealName}
    </Typography>
    <Typography
      variant="body1"
      component="span"
      sx={theme => ({
        fontWeight: theme.typography.fontWeightBold,
        color: theme.palette.text.secondary,
      })}
    >{`${totalCalories} kcal`}</Typography>
  </Stack>
);
