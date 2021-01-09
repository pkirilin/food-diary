import React, { useState } from 'react';
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
import { CategoryItem } from '../models';
import CategoryCreateEditDialog from './CategoryCreateEditDialog';
import { ConfirmationDialog } from '../../__shared__/components';

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
  const [categoryEditDialogOpen, setCategoryEditDialogOpen] = useState(false);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);

  const handleEditClick = (): void => {
    setCategoryEditDialogOpen(true);
  };

  const handleDeleteClick = (): void => {
    setCategoryDeleteDialogOpen(true);
  };

  const handleCategoryEditDialogClose = (): void => {
    setCategoryEditDialogOpen(false);
  };

  const handleCategoryEditDialogConfirm = (): void => {
    return;
  };

  const handleCategoryDeleteDialogClose = (): void => {
    setCategoryDeleteDialogOpen(false);
  };

  const handleCategoryDeleteDialogConfirm = (): void => {
    return;
  };

  return (
    <ListItem className={classes.root}>
      <CategoryCreateEditDialog
        open={categoryEditDialogOpen}
        onClose={handleCategoryEditDialogClose}
        onDialogCancel={handleCategoryEditDialogClose}
        onDialogConfirm={handleCategoryEditDialogConfirm}
        category={category}
      ></CategoryCreateEditDialog>
      <ConfirmationDialog
        open={categoryDeleteDialogOpen}
        dialogTitle="Delete category confirmation"
        dialogMessage={`Are you sure you want to delete category '${category.name}' and all its products?`}
        onClose={handleCategoryDeleteDialogClose}
        onDialogCancel={handleCategoryDeleteDialogClose}
        onDialogConfirm={handleCategoryDeleteDialogConfirm}
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
