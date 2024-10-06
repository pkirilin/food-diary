import { type FC } from 'react';
import { useLoaderData, type LoaderFunction } from 'react-router-dom';
import { store } from '@/app/store';
import { type GetWeightLogsRequest, weightLogsApi } from '@/entities/weightLog';
import { dateLib } from '@/shared/lib';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { WeightChart } from '@/widgets/WeightChart';
import { WeightLogsList } from '@/widgets/WeightLogsList';

interface LoaderData extends NavigationLoaderData {
  weightLogsRequest: GetWeightLogsRequest;
}

export const loader: LoaderFunction = async () => {
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
    } satisfies LoaderData;
  } finally {
    weightLogsQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const { weightLogsRequest } = useLoaderData() as LoaderData;

  return (
    <>
      <WeightChart weightLogsRequest={weightLogsRequest} />
      <WeightLogsList weightLogsRequest={weightLogsRequest} />
    </>
  );
};
