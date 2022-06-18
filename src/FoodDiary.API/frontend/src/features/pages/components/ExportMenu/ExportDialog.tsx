import { useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { KeyboardDatePicker } from '@material-ui/pickers';

import { useValidatedDateInput } from 'src/features/__shared__/hooks';
import { createDateValidator } from 'src/features/__shared__/validators';
import { ExportFormat } from '../../models';

import LoadingButton from './LoadingButton';
import { useExportToJson } from './useExportToJson';
import { useExportToGoogleDocs } from './useExportToGoogleDocs';

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

  const exportToJson = useExportToJson(startDate, endDate, onClose);
  const exportToGoogleDocs = useExportToGoogleDocs(startDate, endDate, onClose);

  const isExportDisabled = !isValidStartDate || !isValidEndDate;

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
