import { type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppLoader } from '@/shared/ui';
import { router } from '../routing';

export const Root: FC = () => <RouterProvider router={router} fallbackElement={<AppLoader />} />;
