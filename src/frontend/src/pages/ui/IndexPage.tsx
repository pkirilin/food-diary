import { Typography } from '@mui/material';
import { type FC } from 'react';
import { type LoaderFunction, useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { noteApi, noteLib } from '@/entities/note';
import { SelectDate } from '@/features/note/selectDate';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { MealsList } from '@/widgets/MealsList';
import { type NavigationLoaderData } from '@/widgets/Navigation';

interface LoaderData extends NavigationLoaderData {
  date: string;
}

const getFallbackDate = (): string =>
  MSW_ENABLED ? '2023-10-19' : dateLib.formatToISOStringWithoutTime(new Date());

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? getFallbackDate();
  const notesQuery = await store.dispatch(noteApi.endpoints.notes.initiate({ date }));
  const totalCalories = noteLib.calculateCalories(notesQuery.data?.notes ?? []);

  return {
    date,
    navigation: {
      title: <SelectDate currentDate={new Date(date)} />,
      action: (
        <Typography variant="h6" component="span">
          {totalCalories} kcal
        </Typography>
      ),
    },
  } satisfies LoaderData;
};

export const Component: FC = () => {
  const { date } = useLoaderData() as LoaderData;
  const notes = noteLib.useNotes(date);

  return <MealsList date={date} notes={notes.data} />;
};
