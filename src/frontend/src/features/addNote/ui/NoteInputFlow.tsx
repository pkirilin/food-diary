import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { type productModel } from '@/entities/product';
import { actions } from '../model';
import { type ProductFormValues } from '../model/productForm';
import { ProductForm } from './ProductForm';
import { QuantityForm } from './QuantityForm';
import { SearchProducts } from './SearchProducts';

const toProductFormValues = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: productModel.AutocompleteFreeSoloOption): ProductFormValues => ({
  name,
  caloriesCost,
  defaultQuantity,
  // TODO: use first category as a default value
  category,
});

export const NoteInputFlow: FC = () => {
  const product = useAppSelector(state => state.addNote.draft?.product);
  const categorySelectData = categoryLib.useCategorySelectData();
  const dispatch = useAppDispatch();

  if (!product) {
    return <SearchProducts />;
  }

  if (product.freeSolo && product.editing) {
    return (
      <ProductForm
        defaultValues={toProductFormValues(product)}
        categories={categorySelectData.data}
        categoriesLoading={categorySelectData.isLoading}
        onSubmit={data => dispatch(actions.productSaved(data))}
      />
    );
  }

  return <QuantityForm />;
};
