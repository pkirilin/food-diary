import { useCallback, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { type productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { actions, selectors } from '../model';
import { type ProductFormValues } from '../model/productForm';
import { ImagePreview } from './ImagePreview';
import { NoteForm } from './NoteForm';
import { ProductForm } from './ProductForm';
import { SearchProducts } from './SearchProducts';
import { SearchProductsOnImage } from './SearchProductsOnImage';

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
  const image = useAppSelector(state => state.addNote.image);
  const activeFormId = useAppSelector(selectors.activeFormId);
  const categorySelect = categoryLib.useCategorySelectData();
  const dispatch = useAppDispatch();

  const validateProduct = useCallback(
    (isValid: boolean) => dispatch(actions.draftValidated(isValid)),
    [dispatch],
  );

  if (!product && image) {
    return (
      <>
        <ImagePreview image={image} onRemove={() => dispatch(actions.imageRemoved())} />
        <SearchProductsOnImage image={image} />
      </>
    );
  }

  if (!product) {
    return <SearchProducts />;
  }

  if (product.freeSolo && product.editing) {
    return (
      <ProductForm
        formId={activeFormId}
        defaultValues={toProductFormValues(product, categorySelect.data)}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={data => dispatch(actions.productSaved(data))}
        onValidate={validateProduct}
      />
    );
  }

  return <NoteForm quantity={product.defaultQuantity} />;
};
