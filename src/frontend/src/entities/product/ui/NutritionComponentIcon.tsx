import { type FC } from 'react';
import { nutritionComponents, type NutritionComponent } from '../model/nutritionComponents';

interface Props {
  type: NutritionComponent;
  size?: 'small' | 'medium' | number;
}

export const NutritionComponentIcon: FC<Props> = ({ type, size = 'small' }) => {
  const { IconComponent, color } = nutritionComponents[type];

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
