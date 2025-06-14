import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import { type SvgIconProps } from '@mui/material';
import { blue, pink, grey, amber, purple, green } from '@mui/material/colors';
import { type ComponentType } from 'react';

export type NutritionComponent = 'calories' | 'protein' | 'fats' | 'carbs' | 'sugar' | 'salt';

type Unit = 'kcal' | 'g';

interface NutritionComponentConfig {
  readonly IconComponent: ComponentType<SvgIconProps>;
  readonly color: string;
  readonly unit: Unit;
}

type NutritionComponentsDictionary = Readonly<Record<NutritionComponent, NutritionComponentConfig>>;

export const nutritionComponents: NutritionComponentsDictionary = {
  calories: {
    IconComponent: WhatshotOutlinedIcon,
    color: green[500],
    unit: 'kcal',
  },
  protein: {
    IconComponent: FitnessCenterOutlinedIcon,
    color: blue[500],
    unit: 'g',
  },
  fats: {
    IconComponent: WaterDropOutlinedIcon,
    color: amber[500],
    unit: 'g',
  },
  carbs: {
    IconComponent: GrainOutlinedIcon,
    color: purple[500],
    unit: 'g',
  },
  sugar: {
    IconComponent: CookieOutlinedIcon,
    color: pink[500],
    unit: 'g',
  },
  salt: {
    IconComponent: AdjustOutlinedIcon,
    color: grey[500],
    unit: 'g',
  },
};
