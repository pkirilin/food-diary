import { Container, LinearProgress } from '@mui/material';
import { useRouterState } from '@tanstack/react-router';
import { type PropsWithChildren, type FC } from 'react';

export const ErrorLayout: FC<PropsWithChildren> = ({ children }) => {
  const loading = useRouterState({ select: state => state.isLoading });

  return (
    <>
      {loading && <LinearProgress />}
      <Container sx={{ py: { xs: 2, md: 3 } }}>{children}</Container>
    </>
  );
};
