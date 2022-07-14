import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import { Category } from '../types';

type DeleteCategoryDialogProps = {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  category: Category;
};

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  category,
}) => {
  function handleClose() {
    setIsDialogOpened(false);
  }

  function handleConfirm() {
    // eslint-disable-next-line no-console
    console.log(`delete category ${category.name}`);
  }

  return (
    <Dialog open={isDialogOpened} onClose={handleClose} fullWidth>
      <DialogTitle>Delete category</DialogTitle>
      <DialogContent>
        <Typography>{`Delete category "${category.name}"?`}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={handleClose}>
          No
        </Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
