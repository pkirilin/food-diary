import { useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { ExportFormat } from '../../models';
import LoadingButton from './LoadingButton';
import { useExportToJson } from './useExportToJson';
import { useExportToGoogleDocs } from './useExportToGoogleDocs';
import { DatePicker } from 'src/components';
import { useValidatedState } from 'src/hooks';
import { validateDate } from 'src/utils';

export type ExportDialogProps = {
  format: ExportFormat;
  isOpen: boolean;
  onClose: () => void;
};

export default function ExportDialog({ format: exportFormat, isOpen, onClose }: ExportDialogProps) {
  const {
    value: startDate,
    setValue: setStartDate,
    clearValue: clearStartDate,
    isInvalid: isStartDateInvalid,
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
    helperText: endDateHelperText,
  } = useValidatedState<Date | null>({
    initialValue: null,
    errorHelperText: 'End date is required',
    validatorFunction: validateDate,
  });

  const exportToJson = useExportToJson(startDate, endDate, onClose);
  const exportToGoogleDocs = useExportToGoogleDocs(startDate, endDate, onClose);
  const isExportDisabled = isStartDateInvalid || isEndDateInvalid;

  useEffect(() => {
    if (!isOpen) {
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
        ></DatePicker>
        <DatePicker
          label="End date"
          placeholder="Select end date"
          date={endDate}
          onChange={value => setEndDate(value)}
          isInvalid={isEndDateInvalid}
          helperText={endDateHelperText}
        ></DatePicker>
      </DialogContent>
      <DialogActions>
        {exportFormat === 'json' ? (
          <LoadingButton
            isLoading={exportToJson.isLoading}
            variant="contained"
            color="primary"
            onClick={exportToJson.start}
            disabled={isExportDisabled}
          >
            Export to JSON
          </LoadingButton>
        ) : (
          <LoadingButton
            isLoading={exportToGoogleDocs.isLoading}
            variant="contained"
            color="primary"
            onClick={exportToGoogleDocs.start}
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
