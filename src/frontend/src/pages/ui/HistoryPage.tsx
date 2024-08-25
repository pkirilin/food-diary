import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { type NoteHistoryItem, noteApi } from '@/entities/note';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  notes: NoteHistoryItem[];
}

export const loader = withAuthStatusCheck(async () => {
  const today = MSW_ENABLED ? new Date('2023-10-19') : new Date();

  const notesHistoryQuery = await store.dispatch(
    noteApi.endpoints.notesHistory.initiate({
      from: dateLib.formatToISOStringWithoutTime(dateLib.getWeeksBefore(today, 2)),
      to: MSW_ENABLED ? '2023-10-21' : dateLib.formatToISOStringWithoutTime(today),
    }),
  );

  return {
    notes: notesHistoryQuery.data?.notesHistory ?? [],
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { notes } = useLoaderData() as LoaderData;

  return (
    <PrivateLayout
      subheader={
        <Stack
          width="100%"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography variant="h6" component="h1">
            History
          </Typography>
          <Tooltip title="Add notes">
            <IconButton edge="end">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <Stack mt={2} component={Paper}>
        <List disablePadding>
          {notes.map(({ date, caloriesCount }) => (
            <ListItem key={date} disablePadding>
              <ListItemButton>
                <ListItemText
                  primary={dateLib.formatToUserFriendlyString(date)}
                  secondary={`${caloriesCount} kcal`}
                />
                <ListItemSecondaryAction>
                  <ChevronRightIcon />
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    </PrivateLayout>
  );
};
