import { Typography } from '@mui/material';
import {
  useEffect,
  type FC,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';
import { AppButton, AppDialog } from 'src/components';
import { categoriesApi } from '../api';
import { type Category } from '../types';

interface DeleteCategoryDialogProps {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  category: Category;
}

const DeleteCategoryDialog: FC<DeleteCategoryDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  category,
}) => {
  const [deleteCategory, deleteCategoryRequest] = categoriesApi.useDeleteCategoryMutation();

  useEffect(() => {
    if (deleteCategoryRequest.isSuccess) {
      setIsDialogOpened(false);
    }
  }, [deleteCategoryRequest.isSuccess, setIsDialogOpened]);

  const handleClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    void deleteCategory(category.id);
  };

  return (
    <AppDialog
      title="Delete category"
      isOpened={isDialogOpened}
      content={
        <form id="delete-category" onSubmit={handleSubmit}>
          <Typography>{`Delete category "${category.name}"?`}</Typography>
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="delete-category"
          variant="contained"
          color="error"
          isLoading={deleteCategoryRequest.isLoading}
          aria-label={`Delete ${category.name}`}
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
          isLoading={deleteCategoryRequest.isLoading}
        >
          No
        </AppButton>
      }
      onClose={handleClose}
    />
  );
};

export default DeleteCategoryDialog;
