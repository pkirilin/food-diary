import { type PropsWithChildren, type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppLoader } from '@/shared/ui';
import { createAppRouter } from '../router';

export const Root: FC<PropsWithChildren> = ({ children }) => (
  <RouterProvider router={createAppRouter(children)} fallbackElement={<AppLoader />} />
);
