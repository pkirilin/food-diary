import { type FC } from 'react';
import { type LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router';
import { noteApi } from '@/entities/note';
import { SelectDateView } from '@/features/note/selectDate';
import { IndexPage } from '@/pages/ui/IndexPage';
import { MSW_ENABLED } from '@/shared/config';
import { createUrl, dateLib } from '@/shared/lib';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import { store } from '../store';

interface LoaderData extends NavigationLoaderData {
  date: string;
}

interface DateSwitcherSlotProps {
  date: string;
}

const getFallbackDate = (): string =>
  MSW_ENABLED ? '2023-10-19' : dateLib.formatToISOStringWithoutTime(new Date());

const DateSwitcherSlot: FC<DateSwitcherSlotProps> = ({ date }) => {
  const navigate = useNavigate();

  return (
    <SelectDateView
      currentDate={new Date(date)}
      onSubmitDate={newDate => {
        navigate(createUrl('/', { date: dateLib.formatToISOStringWithoutTime(newDate) }));
      }}
    />
  );
};

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? getFallbackDate();
  const notesQueryPromise = store.dispatch(noteApi.endpoints.notes.initiate({ date }));

  try {
    await notesQueryPromise;

    return {
      date,
      navigation: {
        title: <DateSwitcherSlot date={date} />,
      },
    };
  } finally {
    notesQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const { date } = useLoaderData<typeof loader>();

  return <IndexPage date={date} />;
};
