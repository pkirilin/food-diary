import { Box, Container, Toolbar } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { SIDEBAR_DRAWER_WIDTH } from '../../constants';
import { HeaderStyled, NavigationProgressStyled, SubheaderStyled } from './AppShell.styles';

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
        <HeaderStyled>
          <Toolbar>{header.navigationBar}</Toolbar>
        </HeaderStyled>
        {header.navigationDrawer}
      </>
    )}
    {withNavigationProgress && <NavigationProgressStyled withSidebar={withSidebar} />}
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
      {subheader && (
        <SubheaderStyled position="sticky" color="inherit" elevation={subheaderElevation}>
          <Container disableGutters>
            <Toolbar>{subheader}</Toolbar>
          </Container>
        </SubheaderStyled>
      )}
      <Container>{children}</Container>
    </Box>
  </>
);
