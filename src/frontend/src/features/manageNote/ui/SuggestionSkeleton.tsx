import { Grid, Skeleton, Stack } from '@mui/material';
import { type FC } from 'react';

export const SuggestionSkeleton: FC = () => (
  <Stack spacing={2} data-testid="suggestion-skeleton">
    <Skeleton variant="rounded" height={56} />
    <Skeleton variant="rounded" height={56} />
    <Grid container spacing={2}>
      <Grid size={6}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      <Grid size={6}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
    </Grid>
    <Skeleton variant="rounded" height={48} />
  </Stack>
);
