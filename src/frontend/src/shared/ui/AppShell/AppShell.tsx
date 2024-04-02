import { Container, Toolbar } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import {
  HeaderStyled,
  MainStyled,
  NavigationProgressStyled,
  SubheaderStyled,
} from './AppShell.styles';

interface HeaderProps {
  navigationBar: ReactElement;
  navigationDrawer: ReactElement;
}

interface Props extends PropsWithChildren {
  withNavigationProgress: boolean;
  withSidebar: boolean;
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
    {withNavigationProgress && (
      <NavigationProgressStyled $withSidebar={withSidebar} $withHeader={!!header} />
    )}
    <MainStyled $withSidebar={withSidebar} $withSubheader={!!subheader}>
      {header && <Toolbar />}
      {subheader && (
        <SubheaderStyled position="sticky" color="inherit" elevation={subheaderElevation}>
          <Container disableGutters>
            <Toolbar>{subheader}</Toolbar>
          </Container>
        </SubheaderStyled>
      )}
      <Container>{children}</Container>
    </MainStyled>
  </>
);
