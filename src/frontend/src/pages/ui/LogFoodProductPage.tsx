import { type FC } from 'react';
import { LogFoodProductDetail } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  productId: number;
  onDone: () => void;
  onEditProduct: () => void;
}

export const LogFoodProductPage: FC<Props> = ({ productId, onDone, onEditProduct }) => (
  <PageContainer>
    <LogFoodProductDetail productId={productId} onDone={onDone} onEditProduct={onEditProduct} />
  </PageContainer>
);
