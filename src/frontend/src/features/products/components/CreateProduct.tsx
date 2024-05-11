import AddIcon from '@mui/icons-material/Add';
import { IconButton, Tooltip } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { productApi, productLib, type productModel } from '@/entities/product';
import { toCreateProductRequest } from '../mapping';
import { useProducts } from '../model';
import { selectProductsQueryArg } from '../selectors';
import { ProductInputDialog } from './ProductInputDialog';

const CreateProduct: FC = () => {
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);
  const getProductsQuery = productApi.useGetProductsQuery(getProductsQueryArg);
  const categorySelect = categoryLib.useCategorySelectData();
  const products = useProducts();
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
      const request = toCreateProductRequest(formData.category.id, formData);
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
            disabled={getProductsQuery.isLoading || createProductRequest.isLoading}
            aria-label="Open create product dialog"
          >
            <AddIcon />
          </IconButton>
        </span>
      </Tooltip>
      <ProductInputDialog
        opened={isDialogOpened}
        title="Create product"
        submitText="Create"
        isLoading={createProductRequest.isLoading || products.isFetching}
        product={product}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={handleDialogSubmit}
        onClose={handleDialogClose}
      />
    </>
  );
};

export default CreateProduct;
