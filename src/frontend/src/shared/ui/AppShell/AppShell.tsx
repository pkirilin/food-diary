import { AppBar, Container, Toolbar } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import {
  HeaderStyled,
  MainContainerStyled,
  MainStyled,
  NavigationProgressStyled,
  SubheaderStyled,
} from './AppShell.styles';

interface HeaderProps {
  navigationBar: ReactElement;
  navigationDrawer: ReactElement;
}

interface SubheaderProps {
  banner: ReactElement;
  navigationBar?: ReactElement;
  navigationBarElevation?: number;
}

interface Props extends PropsWithChildren {
  withNavigationProgress: boolean;
  withSidebar: boolean;
  header?: HeaderProps;
  subheader?: SubheaderProps;
}

export const AppShell: FC<Props> = ({
  children,
  withNavigationProgress,
  withSidebar,
  header,
  subheader,
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
    {withNavigationProgress && (
      <NavigationProgressStyled $withSidebar={withSidebar} $withHeader={!!header} />
    )}
    <MainStyled $withSidebar={withSidebar}>
      {header && <Toolbar />}
      {subheader && (
        <SubheaderStyled elevation={0}>
          {subheader.banner}
          {subheader.navigationBar && (
            <AppBar position="static" color="inherit" elevation={subheader.navigationBarElevation}>
              <Container disableGutters>
                <Toolbar>{subheader.navigationBar}</Toolbar>
              </Container>
            </AppBar>
          )}
        </SubheaderStyled>
      )}
      <MainContainerStyled $withPaddingTop={!!subheader?.navigationBar}>
        {children}
      </MainContainerStyled>
    </MainStyled>
  </>
);
