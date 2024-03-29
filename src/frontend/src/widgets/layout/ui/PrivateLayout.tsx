import { type Theme, useMediaQuery } from '@mui/material';
import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { useToggle } from '@/shared/hooks';
import { AppShell } from '@/shared/ui';
import { NavigationBar } from '@/widgets/navbar';
import { useNavigationProgress } from '../lib';

interface Props extends PropsWithChildren {
  header?: ReactElement;
  withAdditionalNavigation?: boolean;
}

export const PrivateLayout: FC<Props> = ({ children, header, withAdditionalNavigation }) => {
  const navigationProgressVisible = useNavigationProgress();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
  const [menuOpened, toggleMenu] = useToggle(!isMobile);

  useAuthStatusCheckEffect();

  return (
    <AppShell
      withNavigationProgress={navigationProgressVisible}
      withAdditionalNavigation={withAdditionalNavigation}
      withSidebar={menuOpened}
      header={
        <>
          <NavigationBar menuOpened={menuOpened} toggleMenu={toggleMenu} />
          {header}
        </>
      }
    >
      {children}
    </AppShell>
  );
};
