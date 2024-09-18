import { Typography } from '@mui/material';
import { type FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { noteApi, noteLib } from '@/entities/note';
import { SelectDate } from '@/features/note/selectDate';
import { UpdateAppBanner } from '@/features/updateApp';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { AppShell } from '@/shared/ui';
import { useNavigationProgress } from '@/widgets/layout/lib';
import { MealsList } from '@/widgets/MealsList';
import { Navigation } from '@/widgets/Navigation';
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
  const currentDate = new Date(date);
  const navigationProgressVisible = useNavigationProgress();

  return (
    <AppShell
      withNavigationProgress={navigationProgressVisible}
      header={{
        navigation: (
          <Navigation
            title={<SelectDate currentDate={currentDate} />}
            action={
              <Typography variant="h6" component="span">
                {totalCalories} kcal
              </Typography>
            }
          />
        ),
      }}
      subheader={{
        banner: <UpdateAppBanner />,
      }}
    >
      <MealsList date={date} notes={notes.data} />
    </AppShell>
  );
};
