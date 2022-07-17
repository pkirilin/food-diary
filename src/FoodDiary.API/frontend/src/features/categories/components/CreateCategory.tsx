import { styled, Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState } from 'react';
import CreateEditCategoryDialog from './CreateEditCategoryDialog';
import { useCategoriesQuery, useCreateCategoryMutation } from '../api';
import { CategoryFormData } from '../types';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(3),
  bottom: theme.spacing(3),
}));

const CreateCategory: React.FC = () => {
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);

  const [
    createCategory,
    { isLoading: isCreateCategoryLoading, isSuccess: isCreateCategorySuccess },
  ] = useCreateCategoryMutation();

  const { refetch: refetchCategories } = useCategoriesQuery();

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
      <Tooltip title="Create new category">
        <StyledFab color="primary" onClick={handleCreate}>
          <AddIcon />
        </StyledFab>
      </Tooltip>
      <CreateEditCategoryDialog
        isOpened={isCreateDialogOpened}
        setIsOpened={setIsCreateDialogOpened}
        title="Create category"
        submitText="Create"
        onSubmit={handleDialogSubmit}
        isLoading={isCreateCategoryLoading}
      ></CreateEditCategoryDialog>
    </React.Fragment>
  );
};

export default CreateCategory;
