import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { nutritionValuesConfig, type NutritionValueType } from '../model';
import { NutritionValueIcon } from './NutritionValueIcon';

interface Props {
  value: number;
  type: NutritionValueType;
  size: 'small' | 'medium';
  bold?: boolean;
}

export const NutritionValueDisplay: FC<Props> = ({ value, type, size, bold }) => {
  const { unit } = nutritionValuesConfig[type];

  return (
    <Stack direction="row" spacing={size === 'small' ? 0.25 : 0.5}>
      <NutritionValueIcon size={size} type={type} />
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
