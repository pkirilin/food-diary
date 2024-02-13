import { type PropsWithChildren, type FC } from 'react';
import { useNavigationProgress } from '../lib';
import { NavigationBar } from '@/features/navigation';
import { AppShell } from '@/shared/ui';

export const PrivateLayout: FC<PropsWithChildren> = ({ children }) => {
  const navigationProgressVisible = useNavigationProgress();

  return (
    <AppShell withNavigationProgress={navigationProgressVisible} header={<NavigationBar />}>
      {children}
    </AppShell>
  );
};
