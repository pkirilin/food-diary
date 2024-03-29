import { AppBar, Box, Container, LinearProgress, Toolbar } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { APP_BAR_HEIGHT, SIDEBAR_DRAWER_WIDTH } from '../constants';

interface Props extends PropsWithChildren {
  withNavigationProgress: boolean;
  withAdditionalNavigation?: boolean;
  withSidebar?: boolean;
  header?: ReactElement;
}

export const AppShell: FC<Props> = ({
  children,
  withNavigationProgress,
  withAdditionalNavigation,
  withSidebar,
  header,
}) => (
  <>
    {header && (
      <AppBar variant="outlined">
        <Box component={Toolbar} disableGutters px={{ xs: 1, sm: 2, md: 1 }}>
          {header}
        </Box>
      </AppBar>
    )}
    {withNavigationProgress && (
      <LinearProgress
        sx={{
          position: 'absolute',
          top: APP_BAR_HEIGHT,
          width: '100%',
        }}
      />
    )}
    <Box
      component="main"
      pt={withAdditionalNavigation ? 0 : 3}
      pb={3}
      ml={{
        xs: 0,
        md: withSidebar ? `${SIDEBAR_DRAWER_WIDTH}px` : 0,
      }}
      width={{
        xs: '100%',
        md: withSidebar ? `calc(100% - ${SIDEBAR_DRAWER_WIDTH}px)` : '100%',
      }}
    >
      {header && <Toolbar />}
      <Container>{children}</Container>
    </Box>
  </>
);
