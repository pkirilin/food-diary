import { type FC } from 'react';
import { nutrients, type NutrientType } from '../model/nutrients';

interface Props {
  type: NutrientType;
  size?: 'small' | 'medium';
}

export const NutrientIcon: FC<Props> = ({ type, size = 'small' }) => {
  const { IconComponent, color } = nutrients[type];

  return <IconComponent sx={{ color, fontSize: size === 'small' ? 20 : 24 }} />;
};
