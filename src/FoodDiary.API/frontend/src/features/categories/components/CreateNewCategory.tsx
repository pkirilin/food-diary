import { styled, Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Fragment, useState } from 'react';
import CreateEditCategoryDialog from './CreateEditCategoryDialog';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(3),
  bottom: theme.spacing(3),
}));

export default function CreateNewCategory() {
  const [isCreateDialogOpened, setIsCreateDialogOpened] = useState(false);

  return (
    <Fragment>
      <Tooltip title="Create new category">
        <StyledFab color="primary" onClick={() => setIsCreateDialogOpened(true)}>
          <AddIcon />
        </StyledFab>
      </Tooltip>
      <CreateEditCategoryDialog
        isOpened={isCreateDialogOpened}
        setIsOpened={setIsCreateDialogOpened}
        title="Create category"
        submitText="Create"
      ></CreateEditCategoryDialog>
    </Fragment>
  );
}
