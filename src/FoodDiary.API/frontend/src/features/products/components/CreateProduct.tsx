import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState } from 'react';
import { AppFab } from 'src/components';
import { useAppSelector } from 'src/store';
import { useCreateProductMutation, useProductsQuery } from '../api';
import { ProductFormData } from '../types';
import ProductInputDialog from './ProductInputDialog';

const CreateProduct: React.FC = () => {
  const [isDialogOpened, setIsDialogOpened] = useState(false);

  const [createProduct, { isLoading: isCreateProductLoading, isSuccess: isCreateProductSuccess }] =
    useCreateProductMutation();

  const { pageSize, pageNumber, productSearchName, category } = useAppSelector(
    state => state.products.filter,
  );

  const { isLoading: isProductsListLoading, refetch: refetchProducts } = useProductsQuery({
    pageSize,
    pageNumber,
    productSearchName,
    categoryId: category?.id,
  });

  useEffect(() => {
    if (isCreateProductSuccess) {
      refetchProducts();
      setIsDialogOpened(false);
    }
  }, [isCreateProductSuccess, refetchProducts]);

  function handleCreate() {
    setIsDialogOpened(true);
  }

  function handleDialogSubmit({ name, caloriesCost, category }: ProductFormData) {
    createProduct({
      name,
      caloriesCost,
      categoryId: category?.id,
    });
  }

  return (
    <React.Fragment>
      <AppFab
        aria-label="Open create product dialog"
        color="primary"
        onClick={handleCreate}
        disabled={isProductsListLoading || isCreateProductLoading}
      >
        <AddIcon />
      </AppFab>

      <ProductInputDialog
        isOpened={isDialogOpened}
        setIsOpened={setIsDialogOpened}
        title="Create product"
        submitText="Create"
        onSubmit={handleDialogSubmit}
        isLoading={isCreateProductLoading}
      />
    </React.Fragment>
  );
};

export default CreateProduct;
