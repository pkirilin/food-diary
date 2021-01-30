import React from 'react';
import { useDispatch } from 'react-redux';
import { Fab, Grid, makeStyles, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CategoryCreateEditDialog from './CategoryCreateEditDialog';
import { createCategory } from '../thunks';
import { CategoryCreateEdit } from '../models';
import { useDialog } from '../../__shared__/hooks';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const CategoriesHeader: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const categoryCreateDialog = useDialog<CategoryCreateEdit>(category => {
    dispatch(createCategory(category));
  });

  const handleAddClick = (): void => {
    categoryCreateDialog.show();
  };

  return (
    <Grid container justify="space-between" alignItems="center" className={classes.root}>
      <CategoryCreateEditDialog {...categoryCreateDialog.binding}></CategoryCreateEditDialog>
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
