import { Box, Container, LinearProgress } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { APP_BAR_HEIGHT } from '../constants';

interface Props extends PropsWithChildren {
  withNavigationProgress: boolean;
  header?: ReactElement;
}

export const AppShell: FC<Props> = ({ children, withNavigationProgress, header }) => (
  <>
    {header && (
      <Box component="header" position="sticky" top={0} zIndex={theme => theme.zIndex.appBar}>
        {header}
      </Box>
    )}
    {withNavigationProgress && (
      <LinearProgress
        sx={{
          position: 'absolute',
          top: header ? APP_BAR_HEIGHT : 0,
          width: '100%',
        }}
      />
    )}
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
