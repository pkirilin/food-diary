import { useAppDispatch } from '@/app/store';
import { type GetProductByIdResponse, productApi } from '@/entities/product';
import { type ProductFormValues, actions } from '../model';
import { type OnEditProductFn as OnLoadProductForEditFn } from '../ui/NoteForm';

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

export const useLoadProductForEdit = (): [OnLoadProductForEditFn, boolean] => {
  const [getProductById, { isFetching }] = productApi.useLazyProductByIdQuery();
  const dispatch = useAppDispatch();

  const onEdit: OnLoadProductForEditFn = async (productId: number): Promise<void> => {
    dispatch(actions.productForEditLoadStarted());

    const productByIdQuery = await getProductById(productId);

    if (!productByIdQuery.isSuccess) {
      dispatch(actions.productForEditLoadFailed());
      return;
    }

    const product = toProductFormValues(productByIdQuery.data, productId);

    dispatch(actions.productForEditLoaded(product));
  };

  return [onEdit, isFetching];
};
