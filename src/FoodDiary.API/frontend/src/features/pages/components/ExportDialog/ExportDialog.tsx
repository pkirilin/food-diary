import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import format from 'date-fns/format';

import { useValidatedDateInput } from 'src/features/__shared__/hooks';
import { ExportFormat } from 'src/features/__shared__/models';
import { createDateValidator } from 'src/features/__shared__/validators';
import { useDispatch } from 'react-redux';
import { exportPages } from '../../thunks';

const initialFormat = ExportFormat.Json;
const validateDate = createDateValidator(true);

export type ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [startDate, setStartDate, bindStartDate, isValidStartDate] = useValidatedDateInput(null, {
    validate: validateDate,
    errorHelperText: 'Start date is invalid',
  });

  const [endDate, setEndDate, bindEndDate, isValidEndDate] = useValidatedDateInput(null, {
    validate: validateDate,
    errorHelperText: 'End date is invalid',
  });

  const [exportFormat, setExportFormat] = useState(ExportFormat.Json);

  const dispatch = useDispatch();

  const isExportDisabled = !isValidStartDate || !isValidEndDate;

  const handleConfirmClick = (): void => {
    if (!startDate || !endDate) {
      return;
    }

    onClose();

    dispatch(
      exportPages({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        format: exportFormat,
      }),
    );
  };

  useEffect(() => {
    if (isOpen) {
      setStartDate(null);
      setEndDate(null);
      setExportFormat(initialFormat);
    }
  }, [isOpen]);

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
        <Box mt={2}>
          <InputLabel id="format-select-label">Format</InputLabel>
          <Select
            labelId="format-select-label"
            inputProps={{ 'aria-label': 'export format' }}
            fullWidth
            value={exportFormat}
            onChange={event => {
              setExportFormat(event.target.value as ExportFormat);
            }}
          >
            <MenuItem value={ExportFormat.Json}>JSON</MenuItem>
            <MenuItem value={ExportFormat.Pdf}>PDF</MenuItem>
            <MenuItem value="google-docs">Google docs</MenuItem>
          </Select>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmClick}
          disabled={isExportDisabled}
          aria-label="Confirm export and continue"
        >
          Export
        </Button>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
