import { getRouteApi } from '@tanstack/react-router';

const searchRoute = getRouteApi('/_app/log/food/');

export const toSearchQuery = (query: string): string | undefined =>
  query === '' ? undefined : query;

// Going back to the search lands on its history entry, so the query is dropped from that entry
// before leaving it: every return then shows an empty search
export const useClearSearchQuery = (): (() => Promise<void>) => {
  const navigate = searchRoute.useNavigate();
  return () => navigate({ search: {}, replace: true });
};
