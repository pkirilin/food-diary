import { type FC } from 'react';
import { useLoaderData } from 'react-router';
import { type GetWeightLogsRequest, weightLogsApi } from '@/entities/weightLog';
import { WeightPage } from '@/pages/ui/WeightPage';
import { dateLib } from '@/shared/lib';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { store } from '../store';

interface LoaderData extends NavigationLoaderData {
  weightLogsRequest: GetWeightLogsRequest;
}

export const loader = async (): Promise<LoaderData> => {
  const today = dateLib.getCurrentDate();
  const endOfCurrentMonth = dateLib.getEndOfMonth(today);
  const startOfThreeMonthsAgo = dateLib.subMonths(endOfCurrentMonth, 3);

  const weightLogsRequest: GetWeightLogsRequest = {
    from: dateLib.formatToISOStringWithoutTime(startOfThreeMonthsAgo),
    to: dateLib.formatToISOStringWithoutTime(endOfCurrentMonth),
  };

  const weightLogsQueryPromise = store.dispatch(
    weightLogsApi.endpoints.weightLogs.initiate(weightLogsRequest),
  );

  try {
    await weightLogsQueryPromise;

    return {
      weightLogsRequest,
      navigation: { title: 'Weight' },
    };
  } finally {
    weightLogsQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const { weightLogsRequest } = useLoaderData<typeof loader>();

  return <WeightPage weightLogsRequest={weightLogsRequest} />;
};
