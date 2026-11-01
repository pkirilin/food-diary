import { type FC } from 'react';
import { productModel } from '@/entities/product';
import { CreateProductForm } from '@/features/logFood';
import { PageContainer } from '@/shared/ui';

interface Props {
  name: string;
  onCreated: () => void;
}

export const LogFoodCreateProductPage: FC<Props> = ({ name, onCreated }) => (
  <PageContainer>
    <CreateProductForm
      defaultValues={{ ...productModel.EMPTY_FORM_VALUES, name }}
      onCreated={onCreated}
    />
  </PageContainer>
);
