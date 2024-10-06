import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { type FC } from 'react';
import { type WeightLogItem, weightLogsApi, type GetWeightLogsRequest } from '@/entities/weightLog';
import { dateLib } from '@/shared/lib';

const mapToDatasetElementType = ({
  date,
  value,
}: WeightLogItem): Record<string, Date | number> => ({
  date: new Date(date),
  value,
});

interface Props {
  weightLogsRequest: GetWeightLogsRequest;
}

export const WeightChart: FC<Props> = ({ weightLogsRequest }) => {
  const theme = useTheme();

  const { dataset } = weightLogsApi.useWeightLogsQuery(weightLogsRequest, {
    selectFromResult: ({ data }) => ({
      dataset: data?.weightLogs?.map(mapToDatasetElementType).reverse() ?? [],
    }),
  });

  return (
    <LineChart
      colors={[theme.palette.primary.main]}
      xAxis={[
        {
          dataKey: 'date',
          valueFormatter: (value: Date) => dateLib.formatToUserFriendlyString(value),
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
      margin={{ top: 16 }}
    />
  );
};
