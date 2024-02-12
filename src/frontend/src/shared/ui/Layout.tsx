import { Box, Container } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';

interface Props {
  header?: ReactElement;
}

export const Layout: FC<PropsWithChildren<Props>> = ({ children, header }) => {
  return (
    <>
      {header && <Box component="header">{header}</Box>}
      <Container
        component="main"
        sx={theme => ({
          padding: theme.spacing(3),
        })}
      >
        {children}
      </Container>
    </>
  );
};
