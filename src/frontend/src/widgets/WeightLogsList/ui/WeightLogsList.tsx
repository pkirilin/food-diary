import { List, ListSubheader, ListItem, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { weightLogsApi } from '@/entities/weightLog';
import { LogWeightButton } from '@/features/logWeight';
import { dateLib } from '@/shared/lib';

export const WeightLogsList: FC = () => {
  const { weightLogs } = weightLogsApi.useWeightLogsQuery(null, {
    selectFromResult: ({ data }) => ({
      weightLogs: data?.weightLogs ?? [],
    }),
  });

  return (
    <List>
      <ListSubheader
        disableGutters
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>Last logged</span>
        <LogWeightButton />
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
  );
};
