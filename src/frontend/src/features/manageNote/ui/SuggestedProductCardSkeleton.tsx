import { Card, CardContent, Skeleton } from '@mui/material';
import { type FC } from 'react';

export const SuggestedProductCardSkeleton: FC = () => (
  <Card variant="outlined">
    <CardContent>
      <Skeleton variant="text" width="75%" sx={{ fontSize: '2rem' }} />
      <Skeleton variant="text" width="25%" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="text" width="100%" sx={{ fontSize: '3rem' }} />
    </CardContent>
  </Card>
);
