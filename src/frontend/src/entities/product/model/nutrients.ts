import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { type SvgIconProps } from '@mui/material';
import { blue } from '@mui/material/colors';
import { type ComponentType } from 'react';

export type NutrientType = 'protein';

interface NutrientConfig {
  readonly IconComponent: ComponentType<SvgIconProps>;
  readonly color: string;
}

type NutrientsDictionary = Readonly<Record<NutrientType, NutrientConfig>>;

export const nutrients: NutrientsDictionary = {
  protein: {
    IconComponent: FitnessCenterIcon,
    color: blue[500],
  },
};
