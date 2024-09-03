import { Box, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { noteApi, noteLib } from '@/entities/note';
import { SelectDate } from '@/features/note/selectDate';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { PrivateLayout } from '@/widgets/layout';
import { MealsList } from '@/widgets/MealsList';
import { withAuthStatusCheck } from '../lib';

interface LoaderData {
  date: string;
}

const getFallbackDate = (): string =>
  MSW_ENABLED ? '2023-10-19' : dateLib.formatToISOStringWithoutTime(new Date());

export const loader = withAuthStatusCheck(async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? getFallbackDate();
  await store.dispatch(noteApi.endpoints.notes.initiate({ date }));

  return {
    date,
  } satisfies LoaderData;
});

export const Component: FC = () => {
  const { date } = useLoaderData() as LoaderData;
  const notes = noteLib.useNotes(date);
  const totalCalories = noteLib.useCalories(notes.data);

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
          <Box display="flex" alignItems="center" gap={3}>
            <SelectDate currentDate={new Date(date)} />
            <Typography variant="h6" component="h1">
              {dateLib.formatToUserFriendlyString(date)}
            </Typography>
          </Box>
          <Typography variant="h6" component="span">
            {totalCalories} kcal
          </Typography>
        </Stack>
      }
    >
      <MealsList date={date} notes={notes.data} />
    </PrivateLayout>
  );
};
