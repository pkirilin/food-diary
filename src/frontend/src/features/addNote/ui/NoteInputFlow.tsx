import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { ProductForm } from './ProductForm';
import { QuantityForm } from './QuantityForm';
import { SearchProducts } from './SearchProducts';

export const NoteInputFlow: FC = () => {
  const product = useAppSelector(state => state.addNote.draft?.product);

  if (!product) {
    return <SearchProducts />;
  }

  if (!product.freeSolo) {
    return <QuantityForm />;
  }

  return (
    <ProductForm
      defaultValues={{ name: product.name }}
      onSubmit={() => {
        // TODO: save product values to the store
      }}
    />
  );
};
