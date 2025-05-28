import { useAppDispatch } from '@/app/store';
import { type GetProductByIdResponse, productApi, type productModel } from '@/entities/product';
import { actions } from '../model';
import { type OnEditProductFn as OnLoadProductForEditFn } from '../ui/NoteForm';

const toProductFormValues = (
  {
    name,
    defaultQuantity,
    caloriesCost,
    category,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: GetProductByIdResponse,
  productId: number,
): productModel.ProductFormValues => ({
  id: productId,
  name,
  defaultQuantity,
  calories: caloriesCost,
  category: {
    id: category.id,
    name: category.name,
  },
  protein,
  fats,
  carbs,
  sugar,
  salt,
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
