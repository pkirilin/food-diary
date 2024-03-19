import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { AppShell } from '@/shared/ui';
import { NavigationBar } from '@/widgets/navbar';
import { useNavigationProgress } from '../lib';

interface Props extends PropsWithChildren {
  header?: ReactElement;
  mainPaddingX?: string;
  mainPaddingY?: string;
}

export const PrivateLayout: FC<Props> = ({ children, header, mainPaddingX, mainPaddingY }) => {
  const navigationProgressVisible = useNavigationProgress();

  useAuthStatusCheckEffect();

  return (
    <AppShell
      withNavigationProgress={navigationProgressVisible}
      mainPaddingX={mainPaddingX}
      mainPaddingY={mainPaddingY}
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
