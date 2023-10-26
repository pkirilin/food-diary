import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardHeader, CardActions, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../api';
import { Category, CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';
import CategoryTitle from './CategoryTitle';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import ProductsCount from './ProductsCount';

type CategoriesListItemProps = {
  category: Category;
};

const CategoriesListItem: React.FC<CategoriesListItemProps> = ({ category }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [editCategory, editCategoryRequest] = categoriesApi.useEditCategoryMutation();

  useEffect(() => {
    if (editCategoryRequest.isSuccess) {
      setIsEditDialogOpened(false);
    }
  }, [editCategoryRequest.isSuccess]);

  function handleEdit() {
    setIsEditDialogOpened(true);
  }

  function handleDelete() {
    setIsDeleteDialogOpened(true);
  }

  function handleEditDialogSubmit({ name }: CategoryFormData) {
    editCategory({
      id: category.id,
      name,
    });
  }

  return (
    <Card>
      <CardHeader
        sx={{ paddingBottom: 0 }}
        title={<CategoryTitle>{category.name}</CategoryTitle>}
        subheader={<ProductsCount category={category} />}
      />
      <CardActions sx={{ margin: '0 0.5rem' }}>
        <Button aria-label={`Edit ${category.name}`} startIcon={<EditIcon />} onClick={handleEdit}>
          Edit
        </Button>
        <Button
          aria-label={`Delete ${category.name}`}
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </CardActions>

      <CategoryInputDialog
        isOpened={isEditDialogOpened}
        setIsOpened={setIsEditDialogOpened}
        title="Edit category"
        submitText="Save"
        onSubmit={handleEditDialogSubmit}
        isLoading={editCategoryRequest.isLoading}
        category={category}
      />

      <DeleteCategoryDialog
        isOpened={isDeleteDialogOpened}
        setIsOpened={setIsDeleteDialogOpened}
        category={category}
      />
    </Card>
  );
};

export default CategoriesListItem;
