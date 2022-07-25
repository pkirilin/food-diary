import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardHeader, CardActions, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCategoriesQuery, useEditCategoryMutation } from '../api';
import { Category, CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import ProductsCount from './ProductsCount';

type CategoriesListItemProps = {
  category: Category;
};

const CategoriesListItem: React.FC<CategoriesListItemProps> = ({ category }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);

  const [editCategory, { isLoading: isEditCategoryLoading, isSuccess: isEditCategorySuccess }] =
    useEditCategoryMutation();

  const { refetch: refetchCategories } = useCategoriesQuery();

  useEffect(() => {
    if (isEditCategorySuccess) {
      setIsEditDialogOpened(false);
      refetchCategories();
    }
  }, [isEditCategorySuccess, refetchCategories]);

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
        title={category.name}
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
        isLoading={isEditCategoryLoading}
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
