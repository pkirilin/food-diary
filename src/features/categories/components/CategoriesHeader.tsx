import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Fab, Grid, makeStyles, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CategoryCreateEditDialog from './CategoryCreateEditDialog';
import { createCategory } from '../thunks';
import { CategoryCreateEdit } from '../models';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const CategoriesHeader: React.FC = () => {
  const classes = useStyles();
  const [categoryCreateDialogOpen, setCategoryCreateDialogOpen] = useState(false);
  const dispatch = useDispatch();

  const handleAddClick = (): void => {
    setCategoryCreateDialogOpen(true);
  };

  const handleCategoryCreateDialogClose = (): void => {
    setCategoryCreateDialogOpen(false);
  };

  const handleCategoryCreateDialogConfirm = (category: CategoryCreateEdit): void => {
    setCategoryCreateDialogOpen(false);
    dispatch(createCategory(category));
  };

  return (
    <Grid container justify="space-between" alignItems="center" className={classes.root}>
      <CategoryCreateEditDialog
        open={categoryCreateDialogOpen}
        onClose={handleCategoryCreateDialogClose}
        onDialogCancel={handleCategoryCreateDialogClose}
        onDialogConfirm={handleCategoryCreateDialogConfirm}
      ></CategoryCreateEditDialog>
      <Typography variant="h1">Categories</Typography>
      <Tooltip title="Add new category">
        <Fab color="primary" size="small" onClick={handleAddClick}>
          <AddIcon />
        </Fab>
      </Tooltip>
    </Grid>
  );
};

export default CategoriesHeader;
