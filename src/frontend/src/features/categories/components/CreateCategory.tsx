import AddIcon from '@mui/icons-material/Add';
import { type FC, useEffect, useState } from 'react';
import { AppFab } from 'src/components';
import { categoriesApi } from '../api';
import { useCategories } from '../model';
import { type CategoryFormData } from '../types';
import CategoryInputDialog from './CategoryInputDialog';

const CreateCategory: FC = () => {
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);
  const [createCategory, createCategoryRequest] = categoriesApi.useCreateCategoryMutation();
  const categories = useCategories();

  useEffect(() => {
    if (createCategoryRequest.isSuccess && categories.isChanged) {
      setIsCreateDialogOpened(false);
    }
  }, [categories.isChanged, createCategoryRequest.isSuccess]);

  const handleCreate = (): void => {
    setIsCreateDialogOpened(true);
  };

  const handleDialogSubmit = ({ name }: CategoryFormData): void => {
    void createCategory({ name });
  };

  return (
    <>
      <AppFab aria-label="Create new category" color="primary" onClick={handleCreate}>
        <AddIcon />
      </AppFab>

      <CategoryInputDialog
        isOpened={isCreateDialogOpened}
        setIsOpened={setIsCreateDialogOpened}
        title="Create category"
        submitText="Create"
        onSubmit={handleDialogSubmit}
        loading={createCategoryRequest.isLoading || categories.isFetching}
      />
    </>
  );
};

export default CreateCategory;
