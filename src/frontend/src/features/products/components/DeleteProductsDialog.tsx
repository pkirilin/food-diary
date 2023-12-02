import { Typography } from '@mui/material';
import { useEffect, type FC, type Dispatch, type SetStateAction } from 'react';
import { AppButton, AppDialog } from 'src/components';
import { useAppSelector } from 'src/store';
import { productsApi } from '../api';
import { selectCheckedProductIds } from '../selectors';

interface DeleteProductsDialogProps {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
}

const DeleteProductsDialog: FC<DeleteProductsDialogProps> = ({
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

  const handleClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleSubmit = (): void => {
    void deleteProducts({
      ids: checkedProductIds,
    });
  };

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
