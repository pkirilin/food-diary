import { type productModel } from '@/entities/product';
import { productsApi, type CreateProductRequest } from '@/features/products';

const toCreateProductRequest = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: productModel.AutocompleteFreeSoloOption): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId: category?.id ?? 0,
});

type AddProductIfNotExistsFn = (product: productModel.AutocompleteOptionType) => Promise<number>;

export const useAddProductIfNotExists = (): AddProductIfNotExistsFn => {
  const [createProduct] = productsApi.useCreateProductMutation();

  return async product => {
    if (!product.freeSolo) {
      return product.id;
    }

    const createProductRequest = toCreateProductRequest(product);
    const { id } = await createProduct(createProductRequest).unwrap();
    return id;
  };
};
