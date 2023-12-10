import { Typography } from '@mui/material';
import { type FC } from 'react';

interface Props {
  amount: number;
}

export const Calories: FC<Props> = ({ amount }) => (
  <Typography color="GrayText" fontWeight={700}>{`${amount} cal`}</Typography>
);
