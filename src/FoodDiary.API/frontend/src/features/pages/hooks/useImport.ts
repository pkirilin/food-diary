import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector, useDialog } from 'src/hooks';
import { importPages } from '../thunks';

export function useImport(file?: File) {
  const isSuccess = useAppSelector(state => state.pages.isImportSuccess);
  const dispatch = useAppDispatch();

  const { setOpen, binding: dialogProps } = useDialog(() => {
    if (file) {
      dispatch(importPages(file));
    }
  });

  const openDialog = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

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

  return dialogProps;
}
