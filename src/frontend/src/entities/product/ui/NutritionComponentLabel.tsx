import { Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { nutritionComponents, type NutritionComponent } from '../model';
import { NutritionComponentIcon } from './NutritionComponentIcon';

interface Props {
  value: number;
  nutritionComponentType: NutritionComponent;
}

export const NutritionComponentLabel: FC<Props> = ({ value, nutritionComponentType }) => {
  const { unit } = nutritionComponents[nutritionComponentType];

  return (
    <Stack direction="row" spacing={'4px'}>
      <NutritionComponentIcon type={nutritionComponentType} />
      <Typography>{`${value} ${unit}`}</Typography>
    </Stack>
  );
};
