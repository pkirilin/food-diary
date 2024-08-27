import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { type NoteHistoryItem, noteApi } from '@/entities/note';
import { MSW_ENABLED } from '@/shared/config';
import { useToggle } from '@/shared/hooks';
import { dateLib } from '@/shared/lib';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  notes: NoteHistoryItem[];
  today: Date;
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
    today,
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { notes, today } = useLoaderData() as LoaderData;
  const [filterVisible, toggleFilter] = useToggle();

  return (
    <PrivateLayout
      subheader={
        <Stack
          width="100%"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Typography variant="h6" component="h1">
            History
          </Typography>

          <Box display="flex" gap={1}>
            <Tooltip title="Add notes">
              <IconButton>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={filterVisible ? 'Hide filter' : 'Show filter'}>
              <IconButton edge="end" onClick={toggleFilter}>
                {filterVisible ? <FilterAltOffIcon /> : <FilterAltIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      }
    >
      <Collapse in={filterVisible}>
        <DatePicker
          views={['year', 'month']}
          label="Year and Month"
          value={today}
          onChange={_ => {}}
          renderInput={params => <TextField {...params} size="small" margin="normal" />}
        />
      </Collapse>
      <Stack mt={2} spacing={2} component={Paper}>
        <List disablePadding>
          {notes.map(({ date, caloriesCount }) => (
            <ListItem key={date} disableGutters>
              <ListItemButton>
                <ListItemIcon>
                  <CalendarTodayIcon />
                </ListItemIcon>
                <ListItemText primary={dateLib.formatToUserFriendlyString(date)} />
                <Box component={ListItemSecondaryAction} display="flex" alignItems="center" gap={1}>
                  <ListItemText secondary={`${caloriesCount} kcal`} />
                  <ChevronRightIcon />
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    </PrivateLayout>
  );
};
