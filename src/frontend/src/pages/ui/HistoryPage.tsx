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
import { useState, type FC } from 'react';
import { useLoaderData, useSubmit } from 'react-router-dom';
import { store } from '@/app/store';
import { type NoteHistoryItem, noteApi } from '@/entities/note';
import { MSW_ENABLED } from '@/shared/config';
import { useToggle } from '@/shared/hooks';
import { dateLib } from '@/shared/lib';
import { PrivateLayout } from '@/widgets/layout';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  notes: NoteHistoryItem[];
  date: Date;
}

const getFallbackMonth = (): number => (MSW_ENABLED ? 10 : new Date().getMonth() + 1);
const getFallbackYear = (): number => (MSW_ENABLED ? 2023 : new Date().getFullYear());

const getEndOfMonth = (date: Date): string =>
  dateLib.formatToISOStringWithoutTime(dateLib.getEndOfMonth(date));

export const loader = withAuthStatusCheck(async ({ request }) => {
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? getFallbackMonth();
  const year = url.searchParams.get('year') ?? getFallbackYear();
  const date = new Date(+year, +month - 1);

  const notesHistoryQuery = await store.dispatch(
    noteApi.endpoints.notesHistory.initiate({
      from: dateLib.formatToISOStringWithoutTime(date),
      to: getEndOfMonth(date),
    }),
  );

  return {
    notes: notesHistoryQuery.data?.notesHistory ?? [],
    date,
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { notes, date } = useLoaderData() as LoaderData;
  const [filterVisible, toggleFilter] = useToggle();
  const [filterDate, setFilterDate] = useState(date);
  const submit = useSubmit();

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
          value={filterDate}
          onChange={newValue => {
            if (newValue) {
              setFilterDate(newValue);
              submit(
                new URLSearchParams({
                  month: (newValue.getMonth() + 1).toString(),
                  year: newValue.getFullYear().toString(),
                }),
              );
            }
          }}
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
