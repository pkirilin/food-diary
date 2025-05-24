import { type FC } from 'react';
import { nutrients, type NutrientType } from '../model/nutrients';

interface Props {
  type: NutrientType;
}

export const NutrientIcon: FC<Props> = ({ type }) => {
  const { IconComponent, color } = nutrients[type];

  return <IconComponent sx={{ color }} />;
};
