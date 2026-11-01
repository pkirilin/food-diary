import { type FC } from 'react';
import { LogFoodProductDetail } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  productId: number;
  onDone: () => void;
}

export const LogFoodProductPage: FC<Props> = ({ productId, onDone }) => (
  <PageContainer>
    <LogFoodProductDetail productId={productId} onDone={onDone} />
  </PageContainer>
);
