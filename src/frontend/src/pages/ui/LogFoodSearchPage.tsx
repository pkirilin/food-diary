import { type FC } from 'react';
import { LogFoodSearchResults, MealDraftTray } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateProduct: (name: string) => void;
  onLogged: (date: string) => void;
}

export const LogFoodSearchPage: FC<Props> = ({
  query,
  onQueryChange,
  onCreateProduct,
  onLogged,
}) => (
  <PageContainer>
    <LogFoodSearchResults
      query={query}
      onQueryChange={onQueryChange}
      onCreateProduct={onCreateProduct}
    />
    <MealDraftTray onLogged={onLogged} />
  </PageContainer>
);
