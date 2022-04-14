import React, { useEffect, useState } from 'react';
import dateFnsFormat from 'date-fns/format';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';

import { useValidatedDateInput } from 'src/features/__shared__/hooks';
import { ExportFormat } from 'src/features/__shared__/models';
import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { ExportPagesRequest } from 'src/features/pages/thunks';
import { createDateValidator } from 'src/features/__shared__/validators';

interface PagesExportDialogProps extends DialogProps, DialogCustomActionProps<ExportPagesRequest> {}

const initialFormat = ExportFormat.Json;
const validateDate = createDateValidator(true);

const ExportDialog: React.FC<PagesExportDialogProps> = ({
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: PagesExportDialogProps) => {
  const [startDate, setStartDate, bindStartDate, isValidStartDate] = useValidatedDateInput(null, {
    validate: validateDate,
    errorHelperText: 'Start date is invalid',
  });

  const [endDate, setEndDate, bindEndDate, isValidEndDate] = useValidatedDateInput(null, {
    validate: validateDate,
    errorHelperText: 'End date is invalid',
  });

  const [exportFormat, setExportFormat] = useState(ExportFormat.Json);

  const isExportDisabled = !isValidStartDate || !isValidEndDate;

  const handleConfirmClick = (): void => {
    if (!startDate || !endDate) {
      return;
    }

    onDialogConfirm({
      startDate: dateFnsFormat(startDate, 'yyyy-MM-dd'),
      endDate: dateFnsFormat(endDate, 'yyyy-MM-dd'),
      format: exportFormat,
    });
  };

  useEffect(() => {
    if (dialogProps.open) {
      setStartDate(null);
      setEndDate(null);
      setExportFormat(initialFormat);
    }
  }, [dialogProps.open]);

  return (
    <Dialog {...dialogProps}>
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
          aria-label="Export dialog action - confirm"
        >
          Export
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
