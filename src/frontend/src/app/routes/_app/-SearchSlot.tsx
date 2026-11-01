import { getRouteApi } from '@tanstack/react-router';
import { type FC } from 'react';
import { LogFoodSearchField } from '@/features/logFood';

const route = getRouteApi('/_app/log/food/');

export const SearchSlot: FC = () => {
  const { q = '' } = route.useSearch();
  const navigate = route.useNavigate();

  return (
    <LogFoodSearchField
      query={q}
      onQueryChange={query => {
        void navigate({ search: { q: query === '' ? undefined : query }, replace: true });
      }}
    />
  );
};
