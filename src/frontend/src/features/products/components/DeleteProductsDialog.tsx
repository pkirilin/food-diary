import { Typography } from '@mui/material';
import {
  useEffect,
  type FC,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';
import { Button } from '@/shared/ui';
import { AppDialog } from 'src/components';
import { useAppSelector } from 'src/store';
import { productsApi } from '../api';
import { useProducts } from '../model';
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
  const products = useProducts();

  useEffect(() => {
    if (deleteProductRequest.isSuccess && products.isChanged) {
      setIsDialogOpened(false);
    }
  }, [deleteProductRequest.isSuccess, products.isChanged, setIsDialogOpened]);

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
        <Button
          type="submit"
          form="delete-products"
          variant="text"
          color="error"
          loading={deleteProductRequest.isLoading || products.isFetching}
          autoFocus
        >
          Yes
        </Button>
      }
      actionCancel={
        <Button
          type="button"
          variant="text"
          color="inherit"
          onClick={handleClose}
          disabled={deleteProductRequest.isLoading}
        >
          No
        </Button>
      }
      onClose={handleClose}
    />
  );
};

export default DeleteProductsDialog;
