import { AppBar, Box, Container, LinearProgress, Toolbar } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS, SIDEBAR_DRAWER_WIDTH } from '../constants';

interface HeaderProps {
  navigationBar: ReactElement;
  navigationDrawer: ReactElement;
}

interface Props extends PropsWithChildren {
  withNavigationProgress: boolean;
  withSidebar?: boolean;
  header?: HeaderProps;
  subheader?: ReactElement;
  subheaderElevation?: number;
}

export const AppShell: FC<Props> = ({
  children,
  withNavigationProgress,
  withSidebar,
  header,
  subheader,
  subheaderElevation,
}) => (
  <>
    {header && (
      <>
        <Box component={AppBar} zIndex={theme => theme.zIndex.drawer + 1}>
          <Box component={Toolbar} disableGutters px={{ xs: 1, sm: 2, md: 1 }}>
            {header.navigationBar}
          </Box>
        </Box>
        {header.navigationDrawer}
      </>
    )}
    {subheader && (
      <AppBar
        position="sticky"
        elevation={subheaderElevation}
        component={Box}
        color="inherit"
        ml={{
          xs: 0,
          md: withSidebar ? `${SIDEBAR_DRAWER_WIDTH}px` : 0,
        }}
        width={{
          xs: '100%',
          md: withSidebar ? `calc(100% - ${SIDEBAR_DRAWER_WIDTH}px)` : '100%',
        }}
        sx={{
          top: {
            xs: APP_BAR_HEIGHT_XS,
            sm: APP_BAR_HEIGHT_SM,
          },
        }}
      >
        <Container disableGutters>
          <Box
            component={Toolbar}
            disableGutters
            pl={{ xs: 1, sm: 2, md: 1 }}
            pr={{ xs: 2, sm: 3 }}
          >
            {subheader}
          </Box>
        </Container>
      </AppBar>
    )}
    {withNavigationProgress && (
      <LinearProgress
        sx={{
          position: 'absolute',
          top: {
            xs: APP_BAR_HEIGHT_XS,
            sm: APP_BAR_HEIGHT_SM,
          },
          width: '100%',
        }}
      />
    )}
    <Box
      component="main"
      pt={subheader ? 0 : 3}
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
