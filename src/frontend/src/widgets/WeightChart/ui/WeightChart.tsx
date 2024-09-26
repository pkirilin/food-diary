import { LineChart } from '@mui/x-charts/LineChart';
import { type FC } from 'react';
import { type WeightLogItem, weightLogsApi } from '@/entities/weightLog';
import { dateLib } from '@/shared/lib';

const mapToDatasetElementType = ({
  date,
  value,
}: WeightLogItem): Record<string, Date | number> => ({
  date: new Date(date),
  value,
});

export const WeightChart: FC = () => {
  const { dataset, xAxisMinDate, xAxisMaxDate } = weightLogsApi.useWeightLogsQuery(null, {
    selectFromResult: ({ data }) => ({
      dataset: data?.weightLogs?.map(mapToDatasetElementType).reverse() ?? [],
      xAxisMinDate: dateLib.getStartOfMonth(data?.weightLogs?.at(0)?.date ?? new Date()),
      xAxisMaxDate: dateLib.getEndOfMonth(data?.weightLogs?.at(0)?.date ?? new Date()),
    }),
  });

  return (
    <LineChart
      xAxis={[
        {
          dataKey: 'date',
          valueFormatter: (value: Date) => dateLib.formatToUserFriendlyString(value),
          min: xAxisMinDate,
          max: xAxisMaxDate,
        },
      ]}
      series={[
        {
          dataKey: 'value',
          label: 'Weight, kg',
        },
      ]}
      slotProps={{
        legend: { hidden: true },
      }}
      dataset={dataset}
      height={300}
      margin={{
        top: 16,
        right: 8,
        bottom: 24,
        left: 32,
      }}
    />
  );
};
