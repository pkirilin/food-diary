import { LineChart } from '@mui/x-charts/LineChart';
import { type FC } from 'react';
import { dateLib } from '@/shared/lib';

const weightHistory = [
  {
    date: Date.parse('2022-01-01'),
    value: 70,
  },
  {
    date: Date.parse('2022-01-07'),
    value: 75,
  },
  {
    date: Date.parse('2022-01-14'),
    value: 72,
  },
  {
    date: Date.parse('2022-01-21'),
    value: 71,
  },
  {
    date: Date.parse('2022-01-28'),
    value: 73,
  },
];

export const WeightChart: FC = () => (
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
    dataset={weightHistory}
    height={300}
    margin={{
      top: 16,
      right: 8,
      bottom: 24,
      left: 32,
    }}
  />
);
