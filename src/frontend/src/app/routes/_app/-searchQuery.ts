export const toSearchQuery = (query: string): string | undefined =>
  query === '' ? undefined : query;
