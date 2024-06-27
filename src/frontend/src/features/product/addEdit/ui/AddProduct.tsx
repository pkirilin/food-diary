import AddIcon from '@mui/icons-material/Add';
import { IconButton, Tooltip } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { categoryLib } from '@/entities/category';
import { productApi, productLib, type productModel } from '@/entities/product';
import { mapToCreateProductRequest } from '../lib';
import { ProductInputDialog } from './ProductInputDialog';

export const AddProduct: FC = () => {
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const categorySelect = categoryLib.useCategorySelectData();
  const products = productLib.useProducts();
  const [createProduct, createProductRequest] = productApi.useCreateProductMutation();
  const { values: product } = productLib.useFormValues();

  useEffect(() => {
    if (createProductRequest.isSuccess && products.isChanged) {
      setIsDialogOpened(false);
    }
  }, [createProductRequest.isSuccess, products.isChanged]);

  const handleCreate = (): void => {
    setIsDialogOpened(true);
  };

  const handleDialogSubmit = (formData: productModel.FormValues): void => {
    if (formData.category) {
      const request = mapToCreateProductRequest(formData.category.id, formData);
      void createProduct(request);
    }
  };

  const handleDialogClose = (): void => {
    setIsDialogOpened(false);
  };

  return (
    <>
      <Tooltip title="Add new product">
        <span>
          <IconButton
            size="large"
            onClick={handleCreate}
            disabled={products.isLoading || createProductRequest.isLoading}
          >
            <AddIcon />
          </IconButton>
        </span>
      </Tooltip>
      <ProductInputDialog
        opened={isDialogOpened}
        title="New product"
        submitText="Add"
        isLoading={createProductRequest.isLoading || products.isFetching}
        productFormValues={product}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={handleDialogSubmit}
        onClose={handleDialogClose}
      />
    </>
  );
};
