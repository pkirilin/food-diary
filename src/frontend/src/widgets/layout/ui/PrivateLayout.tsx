import { type Theme, useMediaQuery, useScrollTrigger } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { useToggle } from '@/shared/hooks';
import { AppShell } from '@/shared/ui';
import { NavigationBar, NavigationDrawer } from '@/widgets/navbar';
import { useNavigationProgress } from '../lib';

interface Props extends PropsWithChildren {
  subheader?: ReactElement;
}

export const PrivateLayout: FC<Props> = ({ children, subheader }) => {
  const navigationProgressVisible = useNavigationProgress();
  const sm = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
  const [menuOpened, toggleMenu] = useToggle(!isMobile);

  const pageScrolled = useScrollTrigger({
    threshold: (sm ? APP_BAR_HEIGHT_SM : APP_BAR_HEIGHT_XS) / 2,
    disableHysteresis: true,
  });

  useAuthStatusCheckEffect();

  return (
    <AppShell
      withNavigationProgress={navigationProgressVisible}
      withSidebar={menuOpened}
      header={{
        navigationBar: <NavigationBar menuOpened={menuOpened} toggleMenu={toggleMenu} />,
        navigationDrawer: <NavigationDrawer menuOpened={menuOpened} toggleMenu={toggleMenu} />,
      }}
      subheader={subheader}
      subheaderElevation={pageScrolled ? 1 : 0}
    >
      {children}
    </AppShell>
  );
};
