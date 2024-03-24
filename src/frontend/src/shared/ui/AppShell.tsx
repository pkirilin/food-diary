import { AppBar, Container, LinearProgress } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';

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
      <AppBar position="sticky">
        <Container>{header}</Container>
      </AppBar>
    )}
    {withNavigationProgress && (
      <LinearProgress
        sx={{
          position: 'absolute',
          top: 0,
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
