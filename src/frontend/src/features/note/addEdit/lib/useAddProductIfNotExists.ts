import { store } from '@/app/store';
import { type CreateProductRequest, productApi, type productModel } from '@/entities/product';

type AddProductIfNotExistsFn = (product: productModel.AutocompleteOption) => Promise<number>;

const mapToCreateProductRequest = ({
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

export const addProductIfNotExists: AddProductIfNotExistsFn = async product => {
  if (!product.freeSolo) {
    return product.id;
  }

  const request = mapToCreateProductRequest(product);

  const { id } = await store
    .dispatch(productApi.endpoints.createProduct.initiate(request))
    .unwrap();

  return id;
};

export const useAddProductIfNotExists = (): AddProductIfNotExistsFn => {
  const [createProduct] = productApi.useCreateProductMutation();

  return async product => {
    if (!product.freeSolo) {
      return product.id;
    }

    const request = mapToCreateProductRequest(product);
    const { id } = await createProduct(request).unwrap();
    return id;
  };
};
