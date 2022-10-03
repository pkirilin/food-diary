import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useEffect } from 'react';
import { AppButton, DatePicker } from 'src/components';
import { useInput } from 'src/hooks';
import { mapToDateInputProps } from 'src/utils/inputMapping';
import { validateDate } from 'src/utils/validation';
import { ExportFormat } from '../../models';
import { useExportToGoogleDocs } from './useExportToGoogleDocs';
import { useExportToJson } from './useExportToJson';

type ExportDialogProps = {
  format: ExportFormat;
  isOpen: boolean;
  onClose: () => void;
};

const ExportDialog: React.FC<ExportDialogProps> = ({ format: exportFormat, isOpen, onClose }) => {
  const {
    inputProps: startDateInputProps,
    value: startDate,
    clearValue: clearStartDate,
    isInvalid: isStartDateInvalid,
    isTouched: isStartDateTouched,
  } = useInput({
    initialValue: null,
    errorHelperText: 'Start date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
  });

  const {
    inputProps: endDateInputProps,
    value: endDate,
    clearValue: clearEndDate,
    isInvalid: isEndDateInvalid,
    isTouched: isEndDateTouched,
  } = useInput({
    initialValue: null,
    errorHelperText: 'End date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
  });

  const exportToJson = useExportToJson(startDate, endDate, onClose);
  const exportToGoogleDocs = useExportToGoogleDocs(startDate, endDate, onClose);
  const isExportDisabled =
    isStartDateInvalid || isEndDateInvalid || !isStartDateTouched || !isEndDateTouched;

  useEffect(() => {
    if (isOpen) {
      clearStartDate();
      clearEndDate();
    }
  }, [isOpen, clearStartDate, clearEndDate]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Export pages</DialogTitle>
      <DialogContent>
        <DatePicker {...startDateInputProps} label="Start date" placeholder="Select start date" />
        <DatePicker {...endDateInputProps} label="End date" placeholder="Select end date" />
      </DialogContent>
      <DialogActions>
        {exportFormat === 'json' ? (
          <AppButton
            isLoading={exportToJson.isLoading}
            variant="contained"
            color="primary"
            onClick={exportToJson.start}
            disabled={isExportDisabled}
          >
            Export to JSON
          </AppButton>
        ) : (
          <AppButton
            isLoading={exportToGoogleDocs.isLoading}
            variant="contained"
            color="primary"
            onClick={exportToGoogleDocs.start}
            disabled={isExportDisabled}
          >
            Export to Google Docs
          </AppButton>
        )}
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
