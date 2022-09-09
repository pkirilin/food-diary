import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { AppFab } from 'src/components';
import { useAppDispatch, useDialog } from 'src/hooks';
import { ProductCreateEdit } from '../models';
import { createProduct } from '../thunks';
import ProductCreateEditDialog from './ProductCreateEditDialog';

const CreateProduct: React.FC = () => {
  const dispatch = useAppDispatch();

  const productCreateDialog = useDialog<ProductCreateEdit>(product => {
    dispatch(createProduct(product));
  });

  function handleCreate() {
    productCreateDialog.show();
  }

  return (
    <React.Fragment>
      <ProductCreateEditDialog {...productCreateDialog.binding} />
      <AppFab aria-label="Open create product dialog" color="primary" onClick={handleCreate}>
        <AddIcon />
      </AppFab>
    </React.Fragment>
  );
};

export default CreateProduct;
