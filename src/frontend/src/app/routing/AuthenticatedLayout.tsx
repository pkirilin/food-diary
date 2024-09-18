import { type Theme, useMediaQuery, useScrollTrigger } from '@mui/material';
import { type FC, type ReactElement } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { UpdateAppBanner } from '@/features/updateApp';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { useToggle } from '@/shared/hooks';
import { AppShell } from '@/shared/ui';
import { NavigationBar, NavigationDrawer } from '@/widgets/navbar';
import { useNavigationProgress } from './useNavigationProgress';

interface Props {
  subheader?: ReactElement;
}

export const AuthenticatedLayout: FC<Props> = ({ subheader }) => {
  const navigationProgress = useNavigationProgress();
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
      withNavigationProgress={navigationProgress.visible}
      withSidebar={menuOpened}
      header={{
        navigationBar: <NavigationBar menuOpened={menuOpened} toggleMenu={toggleMenu} />,
        navigationDrawer: <NavigationDrawer menuOpened={menuOpened} toggleMenu={toggleMenu} />,
      }}
      subheader={{
        banner: <UpdateAppBanner />,
        navigationBar: subheader,
        navigationBarElevation: pageScrolled ? 1 : 0,
      }}
    >
      <ScrollRestoration />
      <Outlet />
    </AppShell>
  );
};
