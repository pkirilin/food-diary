import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardHeader, CardActions, Button } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { categoriesApi } from '../api';
import { useCategories } from '../model';
import { type Category, type CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';
import CategoryTitle from './CategoryTitle';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import ProductsCount from './ProductsCount';

interface CategoriesListItemProps {
  category: Category;
}

const CategoriesListItem: FC<CategoriesListItemProps> = ({ category }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [editCategory, editCategoryRequest] = categoriesApi.useEditCategoryMutation();
  const categories = useCategories();

  useEffect(() => {
    if (editCategoryRequest.isSuccess && categories.isChanged) {
      setIsEditDialogOpened(false);
    }
  }, [categories.isChanged, editCategoryRequest.isSuccess]);

  const handleEdit = (): void => {
    setIsEditDialogOpened(true);
  };

  const handleDelete = (): void => {
    setIsDeleteDialogOpened(true);
  };

  const handleEditDialogSubmit = ({ name }: CategoryFormData): void => {
    void editCategory({
      id: category.id,
      name,
    });
  };

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
        loading={editCategoryRequest.isLoading || categories.isFetching}
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
