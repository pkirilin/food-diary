import React, { useState } from 'react';
import { Card, CardHeader, CardActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Category, CategoryCreateEdit } from '../types';
import CreateEditCategoryDialog from './CreateEditCategoryDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useEditCategoryMutation } from '../api';

type CategoryListItemNewProps = {
  category: Category;
};

function getCountProductsText(countProducts: number) {
  if (countProducts === 0) {
    return 'no products';
  }

  const suffix = countProducts > 1 ? 'products' : 'product';

  return `${countProducts} ${suffix}`;
}

const CategoryListItemNew: React.FC<CategoryListItemNewProps> = ({ category }) => {
  const countProductsText = getCountProductsText(category.countProducts);
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [editCategory, { isLoading: isEditCategoryLoading }] = useEditCategoryMutation();

  function handleEdit() {
    setIsEditDialogOpened(true);
  }

  function handleDelete() {
    setIsDeleteDialogOpened(true);
  }

  function handleEditDialogSubmit(category: CategoryCreateEdit) {
    editCategory(category);
  }

  return (
    <Card>
      <CardHeader
        sx={{ paddingBottom: 0 }}
        title={category.name}
        subheader={countProductsText}
        subheaderTypographyProps={{
          'aria-label': `There are ${countProductsText} in ${category.name}`,
        }}
      />
      <CardActions sx={{ margin: '0 0.5rem' }}>
        <Button aria-label={`Edit ${category.name}`} startIcon={<EditIcon />} onClick={handleEdit}>
          Edit
        </Button>
        <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
          Delete
        </Button>
      </CardActions>
      <CreateEditCategoryDialog
        isOpened={isEditDialogOpened}
        setIsOpened={setIsEditDialogOpened}
        title="Edit category"
        submitText="Save"
        onSubmit={handleEditDialogSubmit}
        isLoading={isEditCategoryLoading}
        category={{ name: category.name }}
      />
      <DeleteCategoryDialog
        isOpened={isDeleteDialogOpened}
        setIsOpened={setIsDeleteDialogOpened}
        category={category}
      />
    </Card>
  );
};

export default CategoryListItemNew;
