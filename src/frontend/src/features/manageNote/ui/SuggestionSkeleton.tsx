import { Grid2, Skeleton, Stack } from '@mui/material';
import { type FC } from 'react';

export const SuggestionSkeleton: FC = () => (
  <Stack spacing={2} data-testid="suggestion-skeleton">
    <Skeleton variant="rounded" height={56} />
    <Skeleton variant="rounded" height={56} />
    <Grid2 container spacing={2}>
      <Grid2 size={6}>
        <Skeleton variant="rounded" height={56} />
      </Grid2>
      <Grid2 size={6}>
        <Skeleton variant="rounded" height={56} />
      </Grid2>
    </Grid2>
    <Skeleton variant="rounded" height={48} />
  </Stack>
);
