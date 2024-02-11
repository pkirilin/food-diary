import { Container } from '@mui/material';
import { type PropsWithChildren, type FC } from 'react';

export const Layout: FC<PropsWithChildren> = ({ children }) => (
  <Container
    component="main"
    sx={theme => ({
      padding: theme.spacing(2),
    })}
  >
    {children}
  </Container>
);
