import { useEffect } from 'react';
import { GoogleLoginResponse, useGoogleLogin } from 'react-google-login';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import format from 'date-fns/format';

import config from 'src/features/__shared__/config';
import { useValidatedDateInput } from 'src/features/__shared__/hooks';
import { createDateValidator } from 'src/features/__shared__/validators';

import { ExportFormat } from '../../models';
import LoadingButton from './LoadingButton';
import { useLazyExportPagesToGoogleDocsQuery } from 'src/api';

import { useExportToJson } from './useExportToJson';

const validateDate = createDateValidator(true);

export type ExportDialogProps = {
  format: ExportFormat;
  isOpen: boolean;
  onClose: () => void;
};

export default function ExportDialog({ format: exportFormat, isOpen, onClose }: ExportDialogProps) {
  const [startDate, setStartDate, bindStartDate, isValidStartDate] = useValidatedDateInput(null, {
    validate: validateDate,
    errorHelperText: 'Start date is invalid',
  });

  const [endDate, setEndDate, bindEndDate, isValidEndDate] = useValidatedDateInput(null, {
    validate: validateDate,
    errorHelperText: 'End date is invalid',
  });

  const [
    exportToGoogleDocs,
    { isLoading: isExportToGoogleDocsLoading, isSuccess: isExportToGoogleDocsSuccess },
  ] = useLazyExportPagesToGoogleDocsQuery();

  const { signIn } = useGoogleLogin({
    clientId: config.googleClientId,
    onSuccess: response => {
      if (!startDate || !endDate) {
        return;
      }

      const { accessToken } = response as GoogleLoginResponse;

      exportToGoogleDocs({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        accessToken,
      });
    },
    scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive',
  });

  const {
    isLoading: isExportToJsonLoading,
    isSuccess: isExportToJsonSuccess,
    start: startExportToJson,
  } = useExportToJson(startDate, endDate);

  const isExportDisabled = !isValidStartDate || !isValidEndDate;

  useEffect(() => {
    if (isExportToJsonSuccess || isExportToGoogleDocsSuccess) {
      onClose();
    }
  }, [isExportToJsonSuccess, isExportToGoogleDocsSuccess, onClose]);

  function handleExportToGoogleDocsClick() {
    if (!startDate || !endDate) {
      return;
    }

    signIn();
  }

  useEffect(() => {
    if (isOpen) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [isOpen, setEndDate, setStartDate]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Export pages</DialogTitle>
      <DialogContent>
        <KeyboardDatePicker
          {...bindStartDate()}
          fullWidth
          format="dd.MM.yyyy"
          label="Start date"
          inputProps={{ 'aria-label': 'Export start date' }}
        />
        <KeyboardDatePicker
          {...bindEndDate()}
          fullWidth
          format="dd.MM.yyyy"
          margin="normal"
          label="End date"
          inputProps={{ 'aria-label': 'Export end date' }}
        />
      </DialogContent>
      <DialogActions>
        {exportFormat === 'json' ? (
          <LoadingButton
            isLoading={isExportToJsonLoading}
            variant="contained"
            color="primary"
            onClick={() => startExportToJson()}
            disabled={isExportDisabled}
          >
            Export to JSON
          </LoadingButton>
        ) : (
          <LoadingButton
            isLoading={isExportToGoogleDocsLoading}
            variant="contained"
            color="primary"
            onClick={handleExportToGoogleDocsClick}
            disabled={isExportDisabled}
          >
            Export to Google Docs
          </LoadingButton>
        )}
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
