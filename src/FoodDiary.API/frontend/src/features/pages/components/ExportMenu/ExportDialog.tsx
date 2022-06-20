import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { ExportFormat } from '../../models';
import LoadingButton from './LoadingButton';
import { useExportToJson } from './useExportToJson';
import { useExportToGoogleDocs } from './useExportToGoogleDocs';
import { DatePicker } from 'src/components';

export type ExportDialogProps = {
  format: ExportFormat;
  isOpen: boolean;
  onClose: () => void;
};

export default function ExportDialog({ format: exportFormat, isOpen, onClose }: ExportDialogProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const exportToJson = useExportToJson(startDate, endDate, onClose);
  const exportToGoogleDocs = useExportToGoogleDocs(startDate, endDate, onClose);
  const isStartDateValid = startDate !== null;
  const isEndDateValid = endDate !== null;
  const isExportDisabled = !isStartDateValid || !isEndDateValid;

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
        <DatePicker
          label="Start date"
          placeholder="Select start date"
          date={startDate}
          onChange={value => setStartDate(value)}
          isValid={isStartDateValid}
        ></DatePicker>
        <DatePicker
          label="End date"
          placeholder="Select end date"
          date={endDate}
          onChange={value => setEndDate(value)}
          isValid={isEndDateValid}
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
