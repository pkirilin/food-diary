import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { type productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { actions } from '../model';
import { type ProductFormValues } from '../model/productForm';
import { ProductForm } from './ProductForm';
import { QuantityForm } from './QuantityForm';
import { SearchProducts } from './SearchProducts';

const toProductFormValues = (
  { name, caloriesCost, defaultQuantity, category }: productModel.AutocompleteFreeSoloOption,
  categories: SelectOption[],
): ProductFormValues => ({
  name,
  caloriesCost,
  defaultQuantity,
  category: categories.at(0) ?? category,
});

export const NoteInputFlow: FC = () => {
  const product = useAppSelector(state => state.addNote.draft?.product);
  const categorySelect = categoryLib.useCategorySelectData();
  const dispatch = useAppDispatch();

  if (!product) {
    return <SearchProducts />;
  }

  if (product.freeSolo && product.editing) {
    return (
      <ProductForm
        defaultValues={toProductFormValues(product, categorySelect.data)}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={data => dispatch(actions.productSaved(data))}
      />
    );
  }

  return <QuantityForm />;
};
