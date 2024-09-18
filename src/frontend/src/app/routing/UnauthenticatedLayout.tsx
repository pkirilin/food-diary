import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

export const UnauthenticatedLayout: FC = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);
