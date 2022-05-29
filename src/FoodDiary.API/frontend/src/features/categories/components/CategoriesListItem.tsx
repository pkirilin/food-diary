import React from 'react';
import {
  Chip,
  Grid,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { CategoryCreateEdit, CategoryItem } from '../models';
import CategoryCreateEditDialog from './CategoryCreateEditDialog';
import { ConfirmationDialog } from '../../__shared__/components';
import { deleteCategory, editCategory } from '../thunks';
import { useAppDispatch, useDialog } from '../../__shared__/hooks';

type CategoriesListItemProps = {
  category: CategoryItem;
};

const useStyles = makeStyles(() => ({
  root: {
    height: '100px',
  },
}));

const CategoriesListItem: React.FC<CategoriesListItemProps> = ({
  category,
}: CategoriesListItemProps) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const categoryEditDialog = useDialog<CategoryCreateEdit>(categoryInfo => {
    dispatch(
      editCategory({
        id: category.id,
        category: categoryInfo,
      }),
    );
  });

  const categoryDeleteDialog = useDialog(() => {
    dispatch(deleteCategory(category.id));
  });

  const handleEditClick = (): void => {
    categoryEditDialog.show();
  };

  const handleDeleteClick = (): void => {
    categoryDeleteDialog.show();
  };

  return (
    <ListItem className={classes.root}>
      <CategoryCreateEditDialog
        {...categoryEditDialog.binding}
        category={category}
      ></CategoryCreateEditDialog>
      <ConfirmationDialog
        dialogTitle="Delete category confirmation"
        dialogMessage={`Are you sure you want to delete category '${category.name}' and all its products?`}
        {...categoryDeleteDialog.binding}
      ></ConfirmationDialog>
      <ListItemText>
        <Grid container spacing={2}>
          <Grid item>{category.name}</Grid>
          <Grid item>
            {category.countProducts > 0 ? (
              <Chip
                label={`products: ${category.countProducts}`}
                variant="outlined"
                size="small"
              ></Chip>
            ) : (
              <Chip label="empty" size="small"></Chip>
            )}
          </Grid>
        </Grid>
      </ListItemText>
      <ListItemSecondaryAction>
        <Tooltip title="Edit category">
          <IconButton onClick={handleEditClick}>
            <EditIcon></EditIcon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete category">
          <IconButton edge="end" onClick={handleDeleteClick}>
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default CategoriesListItem;
