import { type PropsWithChildren, type FC } from 'react';
import { AppShell } from '@/shared/ui';
import { useNavigationProgress } from '../lib';

export const ErrorLayout: FC<PropsWithChildren> = ({ children }) => {
  const navigationProgressVisible = useNavigationProgress();

  return <AppShell withNavigationProgress={navigationProgressVisible}>{children}</AppShell>;
};
