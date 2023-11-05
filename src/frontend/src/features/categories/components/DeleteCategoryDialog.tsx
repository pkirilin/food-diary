import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { AppButton, AppDialog } from 'src/components';
import { categoriesApi } from '../api';
import { Category } from '../types';

type DeleteCategoryDialogProps = {
  isOpened: boolean;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
  category: Category;
};

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
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

  function handleClose() {
    setIsDialogOpened(false);
  }

  function handleSubmit() {
    deleteCategory(category.id);
  }

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
