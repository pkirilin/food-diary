import { type PropsWithChildren, type FC } from 'react';
import { AppShell } from '@/shared/ui';
import { useNavigationProgress } from './useNavigationProgress';

export const ErrorLayout: FC<PropsWithChildren> = ({ children }) => {
  const navigationProgress = useNavigationProgress();

  return (
    <AppShell withNavigationProgress={navigationProgress.visible} withSidebar={false}>
      {children}
    </AppShell>
  );
};
