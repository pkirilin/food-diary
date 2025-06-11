import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { NutritionComponentIcon } from '@/entities/product/ui/NutritionComponentIcon';

export const NutritionSummaryWidget: FC = () => (
  <Stack direction="row" spacing={1} justifyContent="space-between" pb={1}>
    <Stack direction="row" spacing={1} alignItems="center">
      <NutritionComponentIcon type="calories" size="medium" />
      <Typography variant="h6" component="span" fontWeight="bold">
        Calories
      </Typography>
    </Stack>
    <Typography variant="h6" component="span" fontWeight="bold">
      1234 kcal
    </Typography>
  </Stack>
);
