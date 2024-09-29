import { List, ListSubheader, ListItem, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { type GetWeightLogsRequest, weightLogsApi } from '@/entities/weightLog';
import { LogWeightButton } from '@/features/logWeight';
import { dateLib } from '@/shared/lib';

interface Props {
  weightLogsRequest: GetWeightLogsRequest;
}

export const WeightLogsList: FC<Props> = ({ weightLogsRequest }) => {
  const { weightLogs } = weightLogsApi.useWeightLogsQuery(weightLogsRequest, {
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
        <LogWeightButton weightLogsRequest={weightLogsRequest} />
      </ListSubheader>
      {weightLogs.length === 0 && (
        <ListItem disableGutters disablePadding>
          <ListItemText
            primary="You have not logged any weights yet"
            primaryTypographyProps={{ color: 'textSecondary' }}
          />
        </ListItem>
      )}
      {weightLogs
        .map(({ value, date }) => ({
          weight: value,
          date: dateLib.formatToUserFriendlyString(date),
        }))
        .map(({ weight, date }) => (
          <ListItem key={date} disableGutters disablePadding aria-label={`${weight} kg on ${date}`}>
            <ListItemText primary={`${weight} kg`} secondary={date} />
          </ListItem>
        ))}
    </List>
  );
};
