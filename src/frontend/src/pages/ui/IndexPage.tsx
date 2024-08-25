import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { store } from '@/app/store';
import { type NoteItem, noteApi, noteLib } from '@/entities/note';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { PrivateLayout } from '@/widgets/layout';
import { MealsList } from '@/widgets/MealsList';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  date: string;
  notes: NoteItem[];
}

const getFallbackDate = (): string =>
  MSW_ENABLED ? '2023-10-19' : dateLib.formatToISOStringWithoutTime(new Date());

export const loader = withAuthStatusCheck(async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? getFallbackDate();
  const notesByDateQuery = await store.dispatch(noteApi.endpoints.notesByDate.initiate({ date }));

  return {
    date,
    notes: notesByDateQuery.data?.notes ?? [],
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { date, notes } = useLoaderData() as LoaderData;
  const totalCalories = noteLib.useCalories(notes);

  return (
    <PrivateLayout
      subheader={
        <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" gap={3}>
            <Tooltip title="History">
              <IconButton edge="start" component={Link} to="/history">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography fontWeight="bold">{dateLib.formatToUserFriendlyString(date)}</Typography>
          </Stack>
          <Typography fontWeight="bold">{totalCalories} kcal</Typography>
        </Stack>
      }
    >
      <MealsList date={date} notes={notes} />
    </PrivateLayout>
  );
};
