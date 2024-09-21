import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { WeightChart } from '@/widgets/WeightChart';

interface LoaderData extends NavigationLoaderData {}

export const loader: LoaderFunction = () =>
  ({
    navigation: {
      title: 'Weight',
    },
  }) satisfies LoaderData;

export const Component: FC = () => <WeightChart />;
