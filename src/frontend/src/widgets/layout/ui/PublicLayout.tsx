import { type PropsWithChildren, type FC } from 'react';
import { useNavigationProgress } from '../lib';
import { AppShell } from '@/shared/ui';

export const PublicLayout: FC<PropsWithChildren> = ({ children }) => {
  const navigationProgressVisible = useNavigationProgress();

  return <AppShell withNavigationProgress={navigationProgressVisible}>{children}</AppShell>;
};
