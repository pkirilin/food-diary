import React, { useState } from 'react';
import { Fab, Grid, makeStyles, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CategoryCreateEditDialog from './CategoryCreateEditDialog';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const CategoriesHeader: React.FC = () => {
  const classes = useStyles();
  const [categoryCreateDialogOpen, setCategoryCreateDialogOpen] = useState(false);

  const handleAddClick = (): void => {
    setCategoryCreateDialogOpen(true);
  };

  const handleCategoryCreateDialogClose = (): void => {
    setCategoryCreateDialogOpen(false);
  };

  const handleCategoryCreateDialogConfirm = (): void => {
    return;
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
