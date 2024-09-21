import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { store } from '@/app/store';
import { weightLogsApi } from '@/entities/weightLog';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { WeightChart } from '@/widgets/WeightChart';

interface LoaderData extends NavigationLoaderData {}

export const loader: LoaderFunction = async () => {
  const weightLogsQueryPromise = store.dispatch(weightLogsApi.endpoints.weightLogs.initiate(null));

  try {
    await weightLogsQueryPromise;
    return {
      navigation: {
        title: 'Weight',
      },
    } satisfies LoaderData;
  } finally {
    weightLogsQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => <WeightChart />;
