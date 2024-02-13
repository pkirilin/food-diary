import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { PrivateLayout } from '@/widgets/layout';

export const loader: LoaderFunction = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {};
};

export const Component: FC = () => <PrivateLayout>ProductsPage</PrivateLayout>;
