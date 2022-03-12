import { PageItem, PagesSearchResult } from '../../features/pages/models';

export interface PagesSearchResultModelBuilder {
  please: () => PagesSearchResult;

  withPageItem: (date: string) => PagesSearchResultModelBuilder;
}

export default function createPagesSearchResultModel() {
  const pageItems: PageItem[] = [];
  let totalPagesCount = 0;
  let id = -1;

  const builder: PagesSearchResultModelBuilder = {
    please: () => ({
      totalPagesCount,
      pageItems,
    }),

    withPageItem: (date: string): PagesSearchResultModelBuilder => {
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
