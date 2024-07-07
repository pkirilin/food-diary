import { type CreateProductRequest, productApi, type productModel } from '@/entities/product';

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

type AddProductIfNotExistsFn = (product: productModel.AutocompleteOption) => Promise<number>;

interface Result {
  sendRequest: AddProductIfNotExistsFn;
  isLoading: boolean;
}

export const useAddProductIfNotExists = (): Result => {
  const [addProduct, { isLoading }] = productApi.useCreateProductMutation();

  const sendRequest: AddProductIfNotExistsFn = async product => {
    if (!product.freeSolo) {
      return product.id;
    }

    const request = mapToCreateProductRequest(product);
    const { id } = await addProduct(request).unwrap();
    return id;
  };

  return {
    sendRequest,
    isLoading,
  };
};
