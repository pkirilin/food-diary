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
      weightLogs: data?.weightLogs ?? [],
    }),
  });

  const lastLog = weightLogs.at(-1);

  return (
    <>
      <WeightChart />
      {lastLog && (
        <List>
          <ListSubheader
            disableGutters
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>Last logged</span>
            <AddWeightLog />
          </ListSubheader>

          <ListItem disableGutters disablePadding>
            <ListItemText
              primary={`${lastLog.value} kg`}
              secondary={dateLib.formatToUserFriendlyString(lastLog.date)}
            />
          </ListItem>
        </List>
      )}
    </>
  );
};
