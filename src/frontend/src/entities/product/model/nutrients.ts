import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import { type SvgIconProps } from '@mui/material';
import { blue, pink, grey, amber, purple } from '@mui/material/colors';
import { type ComponentType } from 'react';

export type NutrientType = 'protein' | 'fats' | 'carbs' | 'sugar' | 'salt';

interface NutrientConfig {
  readonly IconComponent: ComponentType<SvgIconProps>;
  readonly color: string;
}

type NutrientsDictionary = Readonly<Record<NutrientType, NutrientConfig>>;

export const nutrients: NutrientsDictionary = {
  protein: {
    IconComponent: FitnessCenterOutlinedIcon,
    color: blue[500],
  },
  fats: {
    IconComponent: WaterDropOutlinedIcon,
    color: amber[500],
  },
  carbs: {
    IconComponent: GrainOutlinedIcon,
    color: purple[500],
  },
  sugar: {
    IconComponent: CookieOutlinedIcon,
    color: pink[500],
  },
  salt: {
    IconComponent: AdjustOutlinedIcon,
    color: grey[500],
  },
};
