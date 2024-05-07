import { type PropsWithChildren, type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from '../router';
import { RootLoader } from './RootLoader';

export const Root: FC<PropsWithChildren> = ({ children }) => (
  <RouterProvider router={createAppRouter(children)} fallbackElement={<RootLoader />} />
);
