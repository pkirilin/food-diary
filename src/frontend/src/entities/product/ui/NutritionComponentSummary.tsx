import { Box, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { nutritionComponents, type NutritionComponent } from '../model';
import { NutritionComponentIcon } from './NutritionComponentIcon';

interface Props {
  value: number;
  type: NutritionComponent;
}

// TODO: fix naming
export const NutritionComponentSummary: FC<Props> = ({ value, type }) => {
  const { unit, color } = nutritionComponents[type];

  return (
    <Stack direction="row" alignItems="center">
      <Box display="flex" justifyContent="center" alignItems="center" p={1}>
        <NutritionComponentIcon type={type} size="medium" />
      </Box>
      <Stack>
        <Typography
          variant="body2"
          component="span"
          color="textSecondary"
          textTransform="capitalize"
        >
          {type}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="baseline">
          <Typography variant="subtitle1" component="span" color={color} fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" component="span" color="textSecondary">
            {unit}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
