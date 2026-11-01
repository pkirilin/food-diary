import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';
import { LogFoodSearchPage } from '@/pages/ui/LogFoodSearchPage';

const SearchSlot = lazy(() =>
  import('./-SearchSlot').then(module => ({ default: module.SearchSlot })),
);

export const Route = createFileRoute('/_app/log/food/')({
  validateSearch: z.object({
    q: z.string().optional().catch(undefined),
  }),
  staticData: {
    appBar: { variant: 'search', Search: SearchSlot },
  },
  component: LogFoodSearchRoute,
});

function LogFoodSearchRoute() {
  const { q = '' } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <LogFoodSearchPage
      query={q}
      onQueryChange={query => {
        void navigate({ search: { q: query === '' ? undefined : query }, replace: true });
      }}
      onOpenProduct={productId => {
        void navigate({ to: '/log/food/products/$productId', params: { productId } });
      }}
      onLogged={date => {
        void navigate({ to: '/', search: { date }, replace: true });
      }}
    />
  );
}
