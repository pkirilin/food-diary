import { type FC } from 'react';
import { LogFoodSearchResults, MealDraftTray } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onOpenProduct: (productId: number) => void;
  onLogged: (date: string) => void;
}

export const LogFoodSearchPage: FC<Props> = ({ query, onQueryChange, onOpenProduct, onLogged }) => (
  <PageContainer>
    <LogFoodSearchResults
      query={query}
      onQueryChange={onQueryChange}
      onOpenProduct={onOpenProduct}
    />
    <MealDraftTray onOpenProduct={onOpenProduct} onLogged={onLogged} />
  </PageContainer>
);
