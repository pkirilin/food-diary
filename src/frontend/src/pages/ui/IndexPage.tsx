import { type FC } from 'react';
import { type LoaderFunction, useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { noteApi, noteModel } from '@/entities/note';
import { SelectDate } from '@/features/note/selectDate';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { MealsList, MealsListTotalCalories } from '@/widgets/MealsList';
import { type NavigationLoaderData } from '@/widgets/Navigation';

interface LoaderData extends NavigationLoaderData {
  date: string;
}

const getFallbackDate = (): string =>
  MSW_ENABLED ? '2023-10-19' : dateLib.formatToISOStringWithoutTime(new Date());

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? getFallbackDate();
  const notesQueryPromise = store.dispatch(noteApi.endpoints.notes.initiate({ date }));

  try {
    const notesQuery = await notesQueryPromise;

    if (notesQuery.isSuccess) {
      store.dispatch(noteModel.actions.notesLoaded(notesQuery.data));
    }

    return {
      date,
      navigation: {
        title: <SelectDate currentDate={new Date(date)} />,
        action: <MealsListTotalCalories />,
      },
    } satisfies LoaderData;
  } finally {
    notesQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const { date } = useLoaderData() as LoaderData;

  return <MealsList date={date} />;
};
