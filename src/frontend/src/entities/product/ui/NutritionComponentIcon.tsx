import { type FC } from 'react';
import { nutritionComponents, type NutritionComponent } from '../model/nutritionComponents';

interface Props {
  type: NutritionComponent;
  size?: 'small' | 'medium';
}

export const NutritionComponentIcon: FC<Props> = ({ type, size = 'small' }) => {
  const { IconComponent, color } = nutritionComponents[type];

  return <IconComponent sx={{ color, fontSize: size === 'small' ? 20 : 24 }} />;
};
