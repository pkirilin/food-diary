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
import { categoriesApi } from '../api';
import { useCategories } from '../model';
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
  const categories = useCategories();

  useEffect(() => {
    if (deleteCategoryRequest.isSuccess && categories.isChanged) {
      setIsDialogOpened(false);
    }
  }, [categories.isChanged, deleteCategoryRequest.isSuccess, setIsDialogOpened]);

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
        <Button
          type="submit"
          form="delete-category"
          variant="text"
          color="error"
          loading={deleteCategoryRequest.isLoading || categories.isFetching}
          aria-label={`Delete ${category.name}`}
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
          disabled={deleteCategoryRequest.isLoading}
        >
          No
        </Button>
      }
      onClose={handleClose}
    />
  );
};

export default DeleteCategoryDialog;
