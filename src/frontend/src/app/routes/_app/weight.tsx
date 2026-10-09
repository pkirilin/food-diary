import { createFileRoute } from '@tanstack/react-router';
import { type GetWeightLogsRequest, weightLogsApi } from '@/entities/weightLog';
import { WeightPage } from '@/pages/ui/WeightPage';
import { dateLib } from '@/shared/lib';

export const Route = createFileRoute('/_app/weight')({
  staticData: {
    appBar: { variant: 'menu', title: 'Weight' },
  },
  loader: async ({ context }) => {
    const today = dateLib.getCurrentDate();
    const endOfCurrentMonth = dateLib.getEndOfMonth(today);
    const startOfThreeMonthsAgo = dateLib.subMonths(endOfCurrentMonth, 3);

    const weightLogsRequest: GetWeightLogsRequest = {
      from: dateLib.formatToISOStringWithoutTime(startOfThreeMonthsAgo),
      to: dateLib.formatToISOStringWithoutTime(endOfCurrentMonth),
    };

    const weightLogsQueryPromise = context.store.dispatch(
      weightLogsApi.endpoints.weightLogs.initiate(weightLogsRequest),
    );

    try {
      await weightLogsQueryPromise;
      return { weightLogsRequest };
    } finally {
      weightLogsQueryPromise.unsubscribe();
    }
  },
  component: WeightRoute,
});

function WeightRoute() {
  const { weightLogsRequest } = Route.useLoaderData();

  return <WeightPage weightLogsRequest={weightLogsRequest} />;
}
