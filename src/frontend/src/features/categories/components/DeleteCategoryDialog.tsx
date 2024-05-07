import { Typography } from '@mui/material';
import {
  useEffect,
  type FC,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';
import { categoryApi, type categoryModel } from '@/entities/category';
import { AppDialog, Button } from '@/shared/ui';
import { useCategories } from '../model';

interface DeleteCategoryDialogProps {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  category: categoryModel.Category;
}

const DeleteCategoryDialog: FC<DeleteCategoryDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  category,
}) => {
  const [deleteCategory, deleteCategoryRequest] = categoryApi.useDeleteCategoryMutation();
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
