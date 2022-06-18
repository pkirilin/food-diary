import React from 'react';
import { Fab, Grid, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AddIcon from '@mui/icons-material/Add';
import CategoryCreateEditDialog from './CategoryCreateEditDialog';
import { createCategory } from '../thunks';
import { CategoryCreateEdit } from '../models';
import { useAppDispatch, useDialog } from '../../__shared__/hooks';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const CategoriesHeader: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const categoryCreateDialog = useDialog<CategoryCreateEdit>(category => {
    dispatch(createCategory(category));
  });

  const handleAddClick = (): void => {
    categoryCreateDialog.show();
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center" className={classes.root}>
      <CategoryCreateEditDialog {...categoryCreateDialog.binding}></CategoryCreateEditDialog>
      <Typography variant="h1">Categories</Typography>
      <Tooltip title="Add new category">
        <Fab color="default" size="small" onClick={handleAddClick}>
          <AddIcon />
        </Fab>
      </Tooltip>
    </Grid>
  );
};

export default CategoriesHeader;
