import { List, ListItem, ListItemText, ListSubheader } from '@mui/material';
import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { store } from '@/app/store';
import { weightLogsApi } from '@/entities/weightLog';
import { AddWeightLog } from '@/features/logWeight';
import { dateLib } from '@/shared/lib';
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

export const Component: FC = () => {
  const { weightLogs } = weightLogsApi.useWeightLogsQuery(null, {
    selectFromResult: ({ data }) => ({
      weightLogs: Array.from(data?.weightLogs ?? []).reverse(),
    }),
  });

  return (
    <>
      <WeightChart />
      <List>
        <ListSubheader
          disableGutters
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>Last logged</span>
          <AddWeightLog />
        </ListSubheader>
        {weightLogs.length === 0 && (
          <ListItem disableGutters disablePadding>
            <ListItemText
              primary="You have not logged any weights yet"
              primaryTypographyProps={{ color: 'textSecondary' }}
            />
          </ListItem>
        )}
        {weightLogs.map(log => (
          <ListItem key={log.date} disableGutters disablePadding>
            <ListItemText
              primary={`${log.value} kg`}
              secondary={dateLib.formatToUserFriendlyString(log.date)}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};
