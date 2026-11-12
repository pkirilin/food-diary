import { type FC } from 'react';
import { EditProductForm } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  productId: number;
  onSaved: () => void;
}

export const LogFoodEditProductPage: FC<Props> = ({ productId, onSaved }) => (
  <PageContainer>
    <EditProductForm productId={productId} onSaved={onSaved} />
  </PageContainer>
);
