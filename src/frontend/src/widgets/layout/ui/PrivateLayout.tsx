import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { useNavigationProgress } from '../lib';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { AppShell } from '@/shared/ui';
import { NavigationBar } from '@/widgets/navbar';

interface Props extends PropsWithChildren {
  header?: ReactElement;
}

export const PrivateLayout: FC<Props> = ({ children, header }) => {
  const navigationProgressVisible = useNavigationProgress();

  useAuthStatusCheckEffect();

  return (
    <AppShell
      withNavigationProgress={navigationProgressVisible}
      header={
        <>
          <NavigationBar />
          {header}
        </>
      }
    >
      {children}
    </AppShell>
  );
};
