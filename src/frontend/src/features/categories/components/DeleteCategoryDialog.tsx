import { Typography } from '@mui/material';
import { useEffect, type FC, type Dispatch, type SetStateAction } from 'react';
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

  const handleSubmit = (): void => {
    void deleteCategory(category.id);
  };

  return (
    <AppDialog
      title="Delete category"
      isOpened={isDialogOpened}
      content={<Typography>{`Delete category "${category.name}"?`}</Typography>}
      actionSubmit={
        <AppButton
          aria-label={`Delete ${category.name}`}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          isLoading={deleteCategoryRequest.isLoading}
        >
          Yes
        </AppButton>
      }
      actionCancel={
        <AppButton variant="text" onClick={handleClose} isLoading={deleteCategoryRequest.isLoading}>
          No
        </AppButton>
      }
      onClose={handleClose}
    />
  );
};

export default DeleteCategoryDialog;
