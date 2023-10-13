import { PageItem, PagesSearchResult } from 'src/features/pages/models';

export interface PagesSearchResultBuilder {
  please: () => PagesSearchResult;
  withPageItem: (date: string) => PagesSearchResultBuilder;
}

export default function createPagesSearchResultBuilder() {
  const pageItems: PageItem[] = [];
  let totalPagesCount = 0;
  let id = -1;

  const builder: PagesSearchResultBuilder = {
    please: () => ({
      totalPagesCount,
      pageItems,
    }),

    withPageItem: (date: string): PagesSearchResultBuilder => {
      pageItems.push({
        id: ++id,
        date,
        countNotes: 0,
        countCalories: 0,
      });

      totalPagesCount++;

      return builder;
    },
  };

  return builder;
}
