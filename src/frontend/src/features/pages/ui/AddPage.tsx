import AddIcon from '@mui/icons-material/Add';
import { IconButton, Tooltip } from '@mui/material';
import { useState, type FC, useEffect } from 'react';
import { pagesApi } from '../api';
import { PageInputDialog } from '../components/PageInputDialog';
import { useDateForNewPage } from '../hooks';
import { usePages } from '../model';
import { type PageCreateEdit } from '../models';

export const AddPage: FC = () => {
  const dateForNewPage = useDateForNewPage();
  const [isInputDialogOpened, setIsInputDialogOpened] = useState(false);
  const [createPage, createPageRequest] = pagesApi.useCreatePageMutation();
  const pages = usePages();

  useEffect(() => {
    if (createPageRequest.isSuccess && pages.isChanged) {
      setIsInputDialogOpened(false);
    }
  }, [createPageRequest.isSuccess, pages.isChanged]);

  const handleDialogOpen = (): void => {
    setIsInputDialogOpened(true);
  };

  const handleDialogClose = (): void => {
    setIsInputDialogOpened(false);
  };

  const handleDialogSubmit = (page: PageCreateEdit): void => {
    void createPage(page);
  };

  return (
    <>
      <PageInputDialog
        title="New page"
        submitText="Create"
        initialDate={dateForNewPage}
        isOpened={isInputDialogOpened}
        submitInProgress={createPageRequest.isLoading || pages.isFetching}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
      />
      <Tooltip title="Add new page">
        <span>
          <IconButton onClick={handleDialogOpen} size="large">
            <AddIcon />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};
