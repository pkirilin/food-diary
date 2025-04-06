import { useAppDispatch } from '@/app/store';
import { type GetProductByIdResponse, productApi } from '@/entities/product';
import { type ProductFormValues, actions } from '../model';
import { type OnEditProductFn } from '../ui/NoteForm';

const toProductFormValues = (
  { name, defaultQuantity, caloriesCost, category }: GetProductByIdResponse,
  productId: number,
): ProductFormValues => ({
  id: productId,
  name,
  defaultQuantity,
  caloriesCost,
  category: {
    id: category.id,
    name: category.name,
  },
});

export const useEditProduct = (): [OnEditProductFn, boolean] => {
  const [getProductById, { isFetching }] = productApi.useLazyProductByIdQuery();
  const dispatch = useAppDispatch();

  const onEdit: OnEditProductFn = async (productId: number): Promise<void> => {
    const productByIdQuery = await getProductById(productId);

    if (!productByIdQuery.isSuccess) {
      return;
    }

    const product = toProductFormValues(productByIdQuery.data, productId);

    dispatch(actions.productDraftEditStarted(product));
  };

  return [onEdit, isFetching];
};
