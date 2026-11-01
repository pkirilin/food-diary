import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';
import { LogFoodSearchPage } from '@/pages/ui/LogFoodSearchPage';
import { toSearchQuery } from './-searchQuery';

const SearchSlot = lazy(() =>
  import('./-SearchSlot').then(module => ({ default: module.SearchSlot })),
);

const CameraSlot = lazy(() =>
  import('./-CameraSlot').then(module => ({ default: module.CameraSlot })),
);

export const Route = createFileRoute('/_app/log/food/')({
  validateSearch: z.object({
    q: z.string().optional().catch(undefined),
  }),
  staticData: {
    appBar: { variant: 'search', Search: SearchSlot, Actions: CameraSlot },
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
        void navigate({ search: { q: toSearchQuery(query) }, replace: true });
      }}
      onCreateProduct={name => {
        void navigate({ to: '/log/food/products/new', search: { name } });
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
