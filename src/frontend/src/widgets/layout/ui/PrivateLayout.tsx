import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { AppShell } from '@/shared/ui';
import { NavigationBar } from '@/widgets/navbar';
import { useNavigationProgress } from '../lib';

interface Props extends PropsWithChildren {
  header?: ReactElement;
  withAdditionalNavigation?: boolean;
}

export const PrivateLayout: FC<Props> = ({ children, header, withAdditionalNavigation }) => {
  const navigationProgressVisible = useNavigationProgress();

  useAuthStatusCheckEffect();

  return (
    <AppShell
      withNavigationProgress={navigationProgressVisible}
      withAdditionalNavigation={withAdditionalNavigation}
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
