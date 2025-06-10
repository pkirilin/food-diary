import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { nutritionComponents, type NutritionComponent } from '../model';
import { NutritionComponentIcon } from './NutritionComponentIcon';

interface Props {
  value: number;
  nutritionComponentType: NutritionComponent;
  size: 'small' | 'medium';
  bold?: boolean;
}

export const NutritionComponentLabel: FC<Props> = ({
  value,
  nutritionComponentType,
  size,
  bold,
}) => {
  const { unit } = nutritionComponents[nutritionComponentType];

  return (
    <Stack direction="row" spacing={'4px'}>
      <NutritionComponentIcon size={size} type={nutritionComponentType} />
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
