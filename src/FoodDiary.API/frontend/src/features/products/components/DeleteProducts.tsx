import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, IconButton } from '@mui/material';
import React from 'react';
import { ConfirmationDialog } from 'src/components';
import { useAppDispatch, useAppSelector, useDialog } from 'src/hooks';
import { deleteProducts } from '../thunks';

const DeleteProducts: React.FC = () => {
  const selectedProductIds = useAppSelector(state => state.products.selectedProductIds);
  const dispatch = useAppDispatch();

  const productsDeleteDialog = useDialog(() => {
    dispatch(deleteProducts(selectedProductIds));
  });

  function handleDeleteClick() {
    productsDeleteDialog.show();
  }

  return (
    <React.Fragment>
      {selectedProductIds.length > 0 && (
        <Tooltip title="Delete product">
          <IconButton
            onClick={handleDeleteClick}
            size="large"
            aria-label="Delete selected products"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}

      <ConfirmationDialog
        {...productsDeleteDialog.binding}
        dialogTitle="Delete products confirmation"
        dialogMessage="Do you really want to delete selected products?"
      />
    </React.Fragment>
  );
};

export default DeleteProducts;
