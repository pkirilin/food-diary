import { type PropsWithChildren, type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { ReloadPrompt } from '@/widgets/pwa';

export const RootPage: FC<PropsWithChildren> = ({ children }) => (
  <>
    <ScrollRestoration />
    <ReloadPrompt />
    <Outlet />
    {children}
  </>
);
