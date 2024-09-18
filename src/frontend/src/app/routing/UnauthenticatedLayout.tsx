import { type FC, type ReactElement } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { AppShell } from '@/shared/ui';
import { useNavigationProgress } from './useNavigationProgress';

interface Props {
  subheader?: ReactElement;
}

export const UnauthenticatedLayout: FC<Props> = ({ subheader }) => {
  const navigationProgress = useNavigationProgress();

  return (
    <AppShell withNavigationProgress={navigationProgress.visible} withSidebar={false}>
      <ScrollRestoration />
      <Outlet />
    </AppShell>
  );
};
