import { Alert } from '@mui/material';
import { type FC } from 'react';

interface Props {
  scope: 'product' | 'summary';
}

export const MissingNutritionValuesAlert: FC<Props> = ({ scope }) => (
  <Alert severity="warning">
    {scope === 'product' ? 'Nutrition values are missing' : 'Some nutrition values are missing'}
  </Alert>
);
