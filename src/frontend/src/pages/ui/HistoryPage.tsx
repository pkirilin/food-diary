import { type FC } from 'react';
import { type LoaderFunction, useLoaderData } from 'react-router-dom';
import { store } from '@/app/store';
import { type NoteHistoryItem, noteApi } from '@/entities/note';
import { MSW_ENABLED } from '@/shared/config';
import { dateLib } from '@/shared/lib';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { FilterNotesHistory, NotesHistoryList } from '@/widgets/NotesHistoryList';

interface LoaderData extends NavigationLoaderData {
  notes: NoteHistoryItem[];
}

const getFallbackMonth = (): number => (MSW_ENABLED ? 10 : new Date().getMonth() + 1);
const getFallbackYear = (): number => (MSW_ENABLED ? 2023 : new Date().getFullYear());

const getEndOfMonth = (date: Date): string =>
  dateLib.formatToISOStringWithoutTime(dateLib.getEndOfMonth(date));

export const loader: LoaderFunction = async ({ request }) => {
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
    navigation: {
      title: 'History',
      action: <FilterNotesHistory date={date} />,
    },
  } satisfies LoaderData;
};

export const Component: FC = () => {
  const { notes } = useLoaderData() as LoaderData;

  return <NotesHistoryList notes={notes} />;
};
