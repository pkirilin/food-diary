import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { AppButton, AppDialog } from 'src/components';
import { useAppSelector } from 'src/store';
import { productsApi } from '../api';
import { selectCheckedProductIds } from '../selectors';

type DeleteProductsDialogProps = {
  isOpened: boolean;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

const DeleteProductsDialog: React.FC<DeleteProductsDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
}) => {
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const [deleteProducts, deleteProductRequest] = productsApi.useDeleteProductsMutation();

  useEffect(() => {
    if (deleteProductRequest.isSuccess) {
      setIsDialogOpened(false);
    }
  }, [deleteProductRequest.isSuccess, setIsDialogOpened]);

  function handleClose() {
    setIsDialogOpened(false);
  }

  function handleSubmit() {
    deleteProducts({
      ids: checkedProductIds,
    });
  }

  return (
    <AppDialog
      title="Delete products"
      isOpened={isDialogOpened}
      content={<Typography>Do you really want to delete selected products?</Typography>}
      actionSubmit={
        <AppButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          isLoading={deleteProductRequest.isLoading}
        >
          Yes
        </AppButton>
      }
      actionCancel={
        <AppButton variant="text" onClick={handleClose} isLoading={deleteProductRequest.isLoading}>
          No
        </AppButton>
      }
      onClose={handleClose}
    />
  );
};

export default DeleteProductsDialog;
