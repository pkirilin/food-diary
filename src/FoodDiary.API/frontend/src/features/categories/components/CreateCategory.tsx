import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState } from 'react';
import { AppFab } from 'src/components';
import { useCategoriesQuery, useCreateCategoryMutation } from '../api';
import { CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';

const CreateCategory: React.FC = () => {
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);

  const [
    createCategory,
    { isLoading: isCreateCategoryLoading, isSuccess: isCreateCategorySuccess },
  ] = useCreateCategoryMutation();

  const { isLoading: isCategoriesListLoading, refetch: refetchCategories } = useCategoriesQuery();

  function handleCreate() {
    setIsCreateDialogOpened(true);
  }

  function handleDialogSubmit({ name }: CategoryFormData) {
    createCategory({ name });
  }

  useEffect(() => {
    if (isCreateCategorySuccess) {
      setIsCreateDialogOpened(false);
      refetchCategories();
    }
  }, [isCreateCategorySuccess, refetchCategories]);

  return (
    <React.Fragment>
      <AppFab
        aria-label="Create new category"
        color="primary"
        onClick={handleCreate}
        disabled={isCategoriesListLoading}
      >
        <AddIcon />
      </AppFab>

      <CategoryInputDialog
        isOpened={isCreateDialogOpened}
        setIsOpened={setIsCreateDialogOpened}
        title="Create category"
        submitText="Create"
        onSubmit={handleDialogSubmit}
        isLoading={isCreateCategoryLoading}
      />
    </React.Fragment>
  );
};

export default CreateCategory;
