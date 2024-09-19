import { Container, LinearProgress } from '@mui/material';
import { type PropsWithChildren, type FC } from 'react';
import { useNavigationProgress } from '@/widgets/Navigation';

export const ErrorLayout: FC<PropsWithChildren> = ({ children }) => {
  const navigationProgress = useNavigationProgress();

  return (
    <>
      {navigationProgress.visible && <LinearProgress />}
      <Container sx={{ py: { xs: 2, md: 3 } }}>{children}</Container>
    </>
  );
};
