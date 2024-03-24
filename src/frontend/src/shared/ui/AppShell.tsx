import { Box, Container, LinearProgress } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { APP_BAR_HEIGHT } from '../constants';

interface Props extends PropsWithChildren {
  withNavigationProgress: boolean;
  withAdditionalNavigation?: boolean;
  header?: ReactElement;
}

export const AppShell: FC<Props> = ({
  children,
  withNavigationProgress,
  withAdditionalNavigation,
  header,
}) => (
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
        paddingTop: withAdditionalNavigation ? 0 : theme.spacing(3),
        paddingBottom: theme.spacing(3),
      })}
    >
      {children}
    </Container>
  </>
);
