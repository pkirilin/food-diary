import { getRouteApi } from '@tanstack/react-router';
import { type FC } from 'react';
import { FilterNotesHistory } from '@/widgets/NotesHistoryList';

const route = getRouteApi('/_app/history');

export const HistoryFilterSlot: FC = () => {
  const { month, year } = route.useLoaderDeps();
  const navigate = route.useNavigate();

  return (
    <FilterNotesHistory
      date={new Date(year, month - 1)}
      onApply={(newMonth, newYear) => {
        navigate({ search: { month: newMonth, year: newYear } });
      }}
    />
  );
};
