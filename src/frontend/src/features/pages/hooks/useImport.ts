import { useCallback, useEffect, useState } from 'react';
import { pagesApi } from '../api';

interface Args {
  file?: File;
  pagesChanged: boolean;
}

interface Result {
  isDialogOpened: boolean;
  isLoading: boolean;
  start: () => void;
  closeDialog: () => void;
}

export function useImport({ file, pagesChanged }: Args): Result {
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const [importFromJson, importFromJsonRequest] = pagesApi.useImportFromJsonMutation();

  const openDialog = useCallback(() => {
    setIsDialogOpened(true);
  }, [setIsDialogOpened]);

  const closeDialog = useCallback(() => {
    setIsDialogOpened(false);
  }, [setIsDialogOpened]);

  const start = useCallback(() => {
    if (file) {
      void importFromJson(file);
    }
  }, [importFromJson, file]);

  useEffect(() => {
    if (file) {
      openDialog();
    }
  }, [file, openDialog]);

  useEffect(() => {
    if (importFromJsonRequest.isSuccess && pagesChanged) {
      closeDialog();
    }
  }, [closeDialog, importFromJsonRequest.isSuccess, pagesChanged]);

  return {
    isDialogOpened,
    isLoading: importFromJsonRequest.isLoading,
    start,
    closeDialog,
  };
}
