import { Typography } from '@mui/material';
import {
  useEffect,
  type FC,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';
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

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    void deleteProducts({ ids: checkedProductIds });
  };

  return (
    <AppDialog
      title="Delete products"
      isOpened={isDialogOpened}
      content={
        <form id="delete-products" onSubmit={handleSubmit}>
          <Typography>Do you really want to delete selected products?</Typography>
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="delete-products"
          variant="contained"
          color="error"
          isLoading={deleteProductRequest.isLoading}
          autoFocus
        >
          Yes
        </AppButton>
      }
      actionCancel={
        <AppButton
          type="button"
          variant="text"
          color="inherit"
          onClick={handleClose}
          isLoading={deleteProductRequest.isLoading}
        >
          No
        </AppButton>
      }
      onClose={handleClose}
    />
  );
};

export default DeleteProductsDialog;
