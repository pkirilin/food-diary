import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { importPages } from '../thunks';

type UseImportResult = {
  isDialogOpened: boolean;
  isLoading: boolean;
  start: () => void;
  closeDialog: () => void;
};

export function useImport(file?: File): UseImportResult {
  const isSuccess = useAppSelector(state => state.pages.isImportSuccess);
  const isLoading = useAppSelector(state => state.pages.isImportLoading);
  const dispatch = useAppDispatch();
  const [isDialogOpened, setIsDialogOpened] = useState(false);

  const openDialog = useCallback(() => {
    setIsDialogOpened(true);
  }, [setIsDialogOpened]);

  const closeDialog = useCallback(() => {
    setIsDialogOpened(false);
  }, [setIsDialogOpened]);

  const start = useCallback(() => {
    if (file) {
      dispatch(importPages(file));
    }
  }, [dispatch, file]);

  useEffect(() => {
    if (file) {
      openDialog();
    }
  }, [file, openDialog]);

  useEffect(() => {
    if (isSuccess) {
      closeDialog();
    }
  }, [closeDialog, isSuccess]);

  return {
    isDialogOpened,
    isLoading,
    start,
    closeDialog,
  };
}
