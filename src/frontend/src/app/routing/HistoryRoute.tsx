import { type FC } from 'react';
import { type LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router';
import { type GetNotesHistoryRequest, noteApi } from '@/entities/note';
import { HistoryPage } from '@/pages/ui/HistoryPage';
import { MSW_ENABLED } from '@/shared/config';
import { createUrl, dateLib } from '@/shared/lib';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { FilterNotesHistory } from '@/widgets/NotesHistoryList';
import { store } from '../store';

interface LoaderData extends NavigationLoaderData {
  notesHistoryRequest: GetNotesHistoryRequest;
}

interface HistoryFilterSlotProps {
  date: Date;
}

const getFallbackMonth = (): number => (MSW_ENABLED ? 10 : new Date().getMonth() + 1);
const getFallbackYear = (): number => (MSW_ENABLED ? 2023 : new Date().getFullYear());

const getEndOfMonth = (date: Date): string =>
  dateLib.formatToISOStringWithoutTime(dateLib.getEndOfMonth(date));

const HistoryFilterSlot: FC<HistoryFilterSlotProps> = ({ date }) => {
  const navigate = useNavigate();

  return (
    <FilterNotesHistory
      date={date}
      onApply={(month, year) => {
        navigate(createUrl('/history', { month, year }));
      }}
    />
  );
};

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? getFallbackMonth();
  const year = url.searchParams.get('year') ?? getFallbackYear();
  const date = new Date(+year, +month - 1);

  const notesHistoryRequest: GetNotesHistoryRequest = {
    from: dateLib.formatToISOStringWithoutTime(date),
    to: getEndOfMonth(date),
  };

  const notesHistoryQueryPromise = store.dispatch(
    noteApi.endpoints.notesHistory.initiate(notesHistoryRequest),
  );

  try {
    await notesHistoryQueryPromise;

    return {
      notesHistoryRequest,
      navigation: {
        title: 'History',
        action: <HistoryFilterSlot date={date} />,
      },
    };
  } finally {
    notesHistoryQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const { notesHistoryRequest } = useLoaderData<typeof loader>();

  return <HistoryPage notesHistoryRequest={notesHistoryRequest} />;
};
