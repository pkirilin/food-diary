import { type FC } from 'react';
import { type LoaderFunction, useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { noteApi } from '@/entities/note';
import { SelectDate } from '@/features/note/selectDate';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { PageContainer } from '@/shared/ui';
import { MealsList } from '@/widgets/MealsList';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { NutritionSummaryWidget } from '@/widgets/NutritionSummaryWidget';

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
    await notesQueryPromise;

    return {
      date,
      navigation: {
        title: <SelectDate currentDate={new Date(date)} />,
      },
    } satisfies LoaderData;
  } finally {
    notesQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const { date } = useLoaderData() as LoaderData;

  return (
    <>
      <NutritionSummaryWidget date={date} />
      <PageContainer $disablePaddingTop>
        <MealsList date={date} />
      </PageContainer>
    </>
  );
};
