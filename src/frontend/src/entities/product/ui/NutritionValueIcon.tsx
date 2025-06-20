import { type FC } from 'react';
import { nutritionValuesConfig, type NutritionValueType } from '../model/nutritionValues';

interface Props {
  type: NutritionValueType;
  size?: 'small' | 'medium' | number;
}

export const NutritionValueIcon: FC<Props> = ({ type, size = 'small' }) => {
  const { IconComponent, color } = nutritionValuesConfig[type];

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      default:
        return size;
    }
  };

  return <IconComponent sx={{ color, fontSize: getFontSize() }} />;
};
