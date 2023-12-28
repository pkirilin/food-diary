import AddIcon from '@mui/icons-material/Add';
import { IconButton, Tooltip } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { categoriesApi } from 'src/features/categories';
import { useAppSelector } from 'src/store';
import { productsApi } from '../api';
import { toCreateProductRequest } from '../mapping';
import { selectProductsQueryArg } from '../selectors';
import { type ProductFormData } from '../types';
import ProductInputDialog from './ProductInputDialog';

const CreateProduct: FC = () => {
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);
  const getProductsQuery = productsApi.useGetProductsQuery(getProductsQueryArg);
  const [getCategories, categoriesRequest] = categoriesApi.useLazyGetCategorySelectOptionsQuery();
  const [createProduct, createProductRequest] = productsApi.useCreateProductMutation();

  useEffect(() => {
    if (createProductRequest.isSuccess) {
      setIsDialogOpened(false);
    }
  }, [createProductRequest.isSuccess]);

  const handleCreate = (): void => {
    setIsDialogOpened(true);
  };

  const handleDialogSubmit = (formData: ProductFormData): void => {
    const request = toCreateProductRequest(formData);
    void createProduct(request);
  };

  const handleLoadCategories = async (): Promise<void> => {
    await getCategories();
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
        isOpened={isDialogOpened}
        setIsOpened={setIsDialogOpened}
        title="Create product"
        submitText="Create"
        onSubmit={handleDialogSubmit}
        isLoading={createProductRequest.isLoading}
        categories={categoriesRequest.data ?? []}
        categoriesLoaded={!categoriesRequest.isUninitialized}
        categoriesLoading={categoriesRequest.isLoading}
        onLoadCategories={handleLoadCategories}
      />
    </>
  );
};

export default CreateProduct;
