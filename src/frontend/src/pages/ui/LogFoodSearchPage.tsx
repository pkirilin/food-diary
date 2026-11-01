import { type FC } from 'react';
import { LogFoodSearchResults, MealDraftTray } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onLogged: (date: string) => void;
}

export const LogFoodSearchPage: FC<Props> = ({ query, onQueryChange, onLogged }) => (
  <PageContainer>
    <LogFoodSearchResults query={query} onQueryChange={onQueryChange} />
    <MealDraftTray onLogged={onLogged} />
  </PageContainer>
);
