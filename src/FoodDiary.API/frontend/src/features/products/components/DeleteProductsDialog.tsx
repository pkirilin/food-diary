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
  const productsQueryArg = useAppSelector(selectProductsQueryArg);

  const { refetch: refetchProducts } = useProductsQuery(productsQueryArg);

  const [deleteProducts, { isLoading: isProductDeleting, isSuccess: isProductDeleted }] =
    useDeleteProductsMutation();

  useEffect(() => {
    if (isProductDeleted) {
      refetchProducts();
      setIsDialogOpened(false);
    }
  }, [isProductDeleted, refetchProducts, setIsDialogOpened]);

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
        <AppButton disabled={isProductDeleting} variant="text" onClick={handleClose}>
          No
        </AppButton>
        <AppButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          isLoading={isProductDeleting}
        >
          Yes
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProductsDialog;
