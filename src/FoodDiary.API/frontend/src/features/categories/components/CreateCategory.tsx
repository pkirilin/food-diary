import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState } from 'react';
import { AppFab } from 'src/components';
import { useCategoriesQuery, useCreateCategoryMutation } from '../api';
import { CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';

const CreateCategory: React.FC = () => {
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);

  const [createCategory, { isLoading: isCategoryCreating, isSuccess: isCategoryCreated }] =
    useCreateCategoryMutation();

  const { isLoading: isLoadingCategories, refetch: refetchCategories } = useCategoriesQuery();

  useEffect(() => {
    if (isCategoryCreated) {
      setIsCreateDialogOpened(false);
      refetchCategories();
    }
  }, [isCategoryCreated, refetchCategories]);

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
        disabled={isLoadingCategories}
      >
        <AddIcon />
      </AppFab>

      <CategoryInputDialog
        isOpened={isCreateDialogOpened}
        setIsOpened={setIsCreateDialogOpened}
        title="Create category"
        submitText="Create"
        onSubmit={handleDialogSubmit}
        isLoading={isCategoryCreating}
      />
    </React.Fragment>
  );
};

export default CreateCategory;
