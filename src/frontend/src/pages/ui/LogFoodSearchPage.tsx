import { type FC } from 'react';
import { LogFoodSearchResults, MealDraftTray } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateProduct: (name: string) => void;
  onOpenProduct: (productId: number) => void;
  onLogged: (date: string) => void;
}

export const LogFoodSearchPage: FC<Props> = ({
  query,
  onQueryChange,
  onCreateProduct,
  onOpenProduct,
  onLogged,
}) => (
  <>
    <MealDraftTray query={query} onOpenProduct={onOpenProduct} onLogged={onLogged} />
    <PageContainer>
      <LogFoodSearchResults
        query={query}
        onQueryChange={onQueryChange}
        onCreateProduct={onCreateProduct}
        onOpenProduct={onOpenProduct}
      />
    </PageContainer>
  </>
);
