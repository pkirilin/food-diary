import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState } from 'react';
import { AppFab } from 'src/components';
import { categoriesApi } from '../api';
import { CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';

const CreateCategory: React.FC = () => {
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
  const [createCategory, createCategoryRequest] = categoriesApi.useCreateCategoryMutation();
  const categoriesQuery = categoriesApi.useGetCategoriesQuery();

  useEffect(() => {
    if (createCategoryRequest.isSuccess) {
      setIsCreateDialogOpened(false);
    }
  }, [createCategoryRequest.isSuccess]);

  function handleCreate() {
    setIsCreateDialogOpened(true);
  }

  function handleDialogSubmit({ name }: CategoryFormData) {
    createCategory({ name });
  }

  return (
    <React.Fragment>
      <AppFab
        aria-label="Create new category"
        color="primary"
        onClick={handleCreate}
        disabled={categoriesQuery.isLoading}
      >
        <AddIcon />
      </AppFab>

      <CategoryInputDialog
        isOpened={isCreateDialogOpened}
        setIsOpened={setIsCreateDialogOpened}
        title="Create category"
        submitText="Create"
        onSubmit={handleDialogSubmit}
        isLoading={createCategoryRequest.isLoading}
      />
    </React.Fragment>
  );
};

export default CreateCategory;
