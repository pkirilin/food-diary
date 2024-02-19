import { type PropsWithChildren, type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

export const RootPage: FC<PropsWithChildren> = ({ children }) => (
  <>
    <ScrollRestoration />
    <Outlet />
    {children}
  </>
);
