import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { nutritionComponents, type NutritionComponent } from '../model';
import { NutritionComponentIcon } from './NutritionComponentIcon';

interface Props {
  value: number;
  type: NutritionComponent;
  size: 'small' | 'medium';
  bold?: boolean;
}

export const NutritionComponentLabel: FC<Props> = ({ value, type, size, bold }) => {
  const { unit } = nutritionComponents[type];

  return (
    <Stack direction="row" spacing={size === 'small' ? 0.25 : 0.5}>
      <NutritionComponentIcon size={size} type={type} />
      <Typography
        variant={size === 'small' ? 'body2' : 'body1'}
        fontWeight={bold ? 'bold' : 'normal'}
      >
        {value}
      </Typography>
      <Typography
        variant={size === 'small' ? 'body2' : 'body1'}
        fontWeight={bold ? 'bold' : 'normal'}
      >
        {unit}
      </Typography>
    </Stack>
  );
};
