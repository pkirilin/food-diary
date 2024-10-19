import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { ProductQuantityInput } from './ProductQuantityInput';
import { SearchProducts } from './SearchProducts';

export const NoteInputFlow: FC = () => {
  const product = useAppSelector(state => state.addNote.draft?.product);

  if (!product) {
    return <SearchProducts />;
  }

  if (!product.freeSolo) {
    return <ProductQuantityInput />;
  }

  // TODO: handle new product creation on the fly
  return <div>New product - not implemented yet</div>;
};
