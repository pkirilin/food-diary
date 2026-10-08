import { type FC } from 'react';
import { Categories } from '@/features/categories';
import { PageContainer } from '@/shared/ui';

export const CategoriesPage: FC = () => (
  <PageContainer>
    <Categories />
  </PageContainer>
);
