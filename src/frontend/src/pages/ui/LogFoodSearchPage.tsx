import { type FC } from 'react';
import { LogFoodSearchResults } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  query: string;
}

export const LogFoodSearchPage: FC<Props> = ({ query }) => (
  <PageContainer>
    <LogFoodSearchResults query={query} />
  </PageContainer>
);
