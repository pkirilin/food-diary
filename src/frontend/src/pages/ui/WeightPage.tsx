import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { type NavigationLoaderData } from '@/widgets/Navigation';

interface LoaderData extends NavigationLoaderData {}

export const loader: LoaderFunction = () =>
  ({
    navigation: {
      title: 'Weight',
    },
  }) satisfies LoaderData;

export const Component: FC = () => <div>Weight page</div>;
