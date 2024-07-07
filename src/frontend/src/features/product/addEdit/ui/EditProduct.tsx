import { type ReactElement, type FC, useState, useEffect, useMemo } from 'react';
import { categoryLib } from '@/entities/category';
import { type Product, productApi, productLib, type productModel } from '@/entities/product';
import { mapToEditProductRequest } from '../lib';
import { ProductInputDialog } from './ProductInputDialog';

interface Props {
  product: Product;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const EditProduct: FC<Props> = ({ product, renderTrigger }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [editProduct, editProductRequest] = productApi.useEditProductMutation();
  const products = productLib.useProducts();
  const productFormData = useMemo(() => productLib.mapToProductFormData(product), [product]);
  const categorySelect = categoryLib.useCategorySelectData();

  useEffect(() => {
    if (editProductRequest.isSuccess && products.isChanged) {
      setIsEditDialogOpened(false);
    }
  }, [editProductRequest.isSuccess, products.isChanged]);

  const handleEditClick = (): void => {
    setIsEditDialogOpened(true);
  };

  const handleEditDialogSubmit = (formData: productModel.FormValues): void => {
    if (formData.category) {
      const request = mapToEditProductRequest(product.id, formData.category.id, formData);
      void editProduct(request);
    }
  };

  const handleEditDialogClose = (): void => {
    setIsEditDialogOpened(false);
  };

  return (
    <>
      {renderTrigger(handleEditClick)}
      <ProductInputDialog
        opened={isEditDialogOpened}
        title="Edit product"
        submitText="Save"
        isLoading={editProductRequest.isLoading || products.isFetching}
        productFormValues={productFormData}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={handleEditDialogSubmit}
        onClose={handleEditDialogClose}
      />
    </>
  );
};
