import AddIcon from '@mui/icons-material/Add';
import { IconButton, Tooltip } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { useAppSelector } from 'src/store';
import { productsApi } from '../api';
import { toCreateProductRequest } from '../mapping';
import { useCategorySelect, useProducts } from '../model';
import { selectProductsQueryArg } from '../selectors';
import { type ProductFormData } from '../types';
import ProductInputDialog from './ProductInputDialog';

const CreateProduct: FC = () => {
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);
  const getProductsQuery = productsApi.useGetProductsQuery(getProductsQueryArg);
  const categorySelect = useCategorySelect();
  const products = useProducts();
  const [createProduct, createProductRequest] = productsApi.useCreateProductMutation();

  useEffect(() => {
    if (createProductRequest.isSuccess && products.isChanged) {
      setIsDialogOpened(false);
    }
  }, [createProductRequest.isSuccess, products.isChanged]);

  const handleCreate = (): void => {
    setIsDialogOpened(true);
  };

  const handleDialogSubmit = (formData: ProductFormData): void => {
    const request = toCreateProductRequest(formData);
    void createProduct(request);
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
        isLoading={createProductRequest.isLoading || products.isFetching}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
      />
    </>
  );
};

export default CreateProduct;
