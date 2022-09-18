import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { AppButton } from 'src/components';
import { useAppSelector } from 'src/store';
import { useDeleteProductsMutation, useProductsQuery } from '../api';
import { selectCheckedProductIds, selectProductsQueryArg } from '../selectors';

type DeleteProductsDialogProps = {
  isOpened: boolean;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

const DeleteProductsDialog: React.FC<DeleteProductsDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
}) => {
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const [deleteProducts, deleteProductsResult] = useDeleteProductsMutation();
  const productsQueryArg = useAppSelector(selectProductsQueryArg);
  const productsQuery = useProductsQuery(productsQueryArg);
  const { refetch: refetchProducts } = productsQuery;

  useEffect(() => {
    if (deleteProductsResult.isSuccess) {
      refetchProducts();
      setIsDialogOpened(false);
    }
  }, [deleteProductsResult.isSuccess, refetchProducts, setIsDialogOpened]);

  function handleClose() {
    setIsDialogOpened(false);
  }

  function handleSubmit() {
    deleteProducts({
      ids: checkedProductIds,
    });
  }

  return (
    <Dialog open={isDialogOpened} onClose={handleClose} fullWidth>
      <DialogTitle>Delete products confirmation</DialogTitle>
      <DialogContent>
        <Typography>Do you really want to delete selected products?</Typography>
      </DialogContent>
      <DialogActions>
        <AppButton disabled={deleteProductsResult.isLoading} variant="text" onClick={handleClose}>
          No
        </AppButton>
        <AppButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          isLoading={deleteProductsResult.isLoading}
        >
          Yes
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProductsDialog;
