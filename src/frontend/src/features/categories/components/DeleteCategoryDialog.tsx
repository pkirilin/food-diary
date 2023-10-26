import { Dialog, DialogTitle, DialogContent, Typography, DialogActions } from '@mui/material';
import React, { useEffect } from 'react';
import { AppButton } from 'src/components';
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
    <Dialog open={isDialogOpened} onClose={handleClose} fullWidth>
      <DialogTitle>Delete category</DialogTitle>
      <DialogContent>
        <Typography>{`Delete category "${category.name}"?`}</Typography>
      </DialogContent>
      <DialogActions>
        <AppButton disabled={deleteCategoryRequest.isLoading} variant="text" onClick={handleClose}>
          No
        </AppButton>
        <AppButton
          aria-label={`Delete ${category.name}`}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          isLoading={deleteCategoryRequest.isLoading}
        >
          Yes
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
