import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { useAuthStatusCheckEffect } from '@/features/auth';

export const AuthenticatedLayout: FC = () => {
  useAuthStatusCheckEffect();

  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
};
