import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { ok, withAuthStatusCheck } from '../lib';
import { PrivateLayout } from '@/widgets/layout';

export const loader: LoaderFunction = withAuthStatusCheck(async () => {
  return ok();
});

export const Component: FC = () => <PrivateLayout>ProductsPage</PrivateLayout>;
