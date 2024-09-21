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
  const { dataset } = weightLogsApi.useWeightLogsQuery(null, {
    selectFromResult: ({ data }) => ({
      dataset: data?.weightLogs?.map(mapToDatasetElementType) ?? [],
    }),
  });

  return (
    <LineChart
      xAxis={[
        {
          dataKey: 'date',
          valueFormatter: (value: Date) => dateLib.formatToUserFriendlyString(value),
          min: new Date('2022-01-01'),
          max: new Date('2022-01-30'),
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
