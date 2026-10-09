import { type FC } from 'react';
import { Products } from '@/features/products';
import { PageContainer } from '@/shared/ui';

export const ProductsPage: FC = () => (
  <PageContainer>
    <Products />
  </PageContainer>
);
