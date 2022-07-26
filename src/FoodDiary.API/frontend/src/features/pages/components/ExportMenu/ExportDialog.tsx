import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useEffect } from 'react';
import { AppButton, DatePicker } from 'src/components';
import { useValidatedState } from 'src/hooks';
import { validateDate } from 'src/utils';
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
    value: startDate,
    setValue: setStartDate,
    clearValue: clearStartDate,
    isInvalid: isStartDateInvalid,
    isTouched: isStartDateTouched,
    helperText: startDateHelperText,
  } = useValidatedState<Date | null>({
    initialValue: null,
    errorHelperText: 'Start date is required',
    validatorFunction: validateDate,
  });

  const {
    value: endDate,
    setValue: setEndDate,
    clearValue: clearEndDate,
    isInvalid: isEndDateInvalid,
    isTouched: isEndDateTouched,
    helperText: endDateHelperText,
  } = useValidatedState<Date | null>({
    initialValue: null,
    errorHelperText: 'End date is required',
    validatorFunction: validateDate,
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
        <DatePicker
          label="Start date"
          placeholder="Select start date"
          date={startDate}
          onChange={value => setStartDate(value)}
          isInvalid={isStartDateInvalid}
          helperText={startDateHelperText}
        />
        <DatePicker
          label="End date"
          placeholder="Select end date"
          date={endDate}
          onChange={value => setEndDate(value)}
          isInvalid={isEndDateInvalid}
          helperText={endDateHelperText}
        />
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
