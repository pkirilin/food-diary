import { Container } from '@mui/material';
import { FC, PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  disablePadding?: boolean;
}

export const PageContainer: FC<Props> = ({ children, disablePadding }) => (
  <Container
    sx={{
      p: disablePadding
        ? 0
        : {
            xs: 2,
            sm: 3,
          },
    }}
  >
    {children}
  </Container>
);
