import AddIcon from '@mui/icons-material/Add';
import { type FC, useEffect, useState } from 'react';
import { AppFab } from 'src/components';
import { categoriesApi } from '../api';
import { type CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';

const CreateCategory: FC = () => {
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
  const [createCategory, createCategoryRequest] = categoriesApi.useCreateCategoryMutation();
  const categoriesQuery = categoriesApi.useGetCategoriesQuery();

  useEffect(() => {
    if (createCategoryRequest.isSuccess) {
      setIsCreateDialogOpened(false);
    }
  }, [createCategoryRequest.isSuccess]);

  const handleCreate = (): void => {
    setIsCreateDialogOpened(true);
  };

  const handleDialogSubmit = ({ name }: CategoryFormData): void => {
    void createCategory({ name });
  };

  return (
    <>
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
    </>
  );
};

export default CreateCategory;
