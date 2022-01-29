import React, { useEffect, useState } from 'react';
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
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import dateFnsFormat from 'date-fns/format';
import { useValidatedDateInput } from '../../__shared__/hooks';
import { ExportFormat } from '../../__shared__/models';
import { DialogCustomActionProps } from '../../__shared__/types';
import { ExportPagesRequest } from '../thunks';
import { createDateValidator } from '../../__shared__/validators';

interface PagesExportDialogProps extends DialogProps, DialogCustomActionProps<ExportPagesRequest> {}

const initialFormat = ExportFormat.Json;
const validateDate = createDateValidator(true);

const PagesExportDialog: React.FC<PagesExportDialogProps> = ({
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
        {/* TODO: move utils provider to app-level */}
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            {...bindStartDate()}
            fullWidth
            format="dd.MM.yyyy"
            label="Start date"
          />
          <KeyboardDatePicker
            {...bindEndDate()}
            fullWidth
            format="dd.MM.yyyy"
            margin="normal"
            label="End date"
          />
        </MuiPickersUtilsProvider>
        <Box mt={2}>
          <InputLabel id="format-select-label">Format</InputLabel>
          <Select
            labelId="format-select-label"
            fullWidth
            value={exportFormat}
            onChange={event => {
              setExportFormat(event.target.value as ExportFormat);
            }}
          >
            <MenuItem value={ExportFormat.Json}>JSON</MenuItem>
            <MenuItem value={ExportFormat.Pdf}>PDF</MenuItem>
          </Select>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmClick}
          disabled={isExportDisabled}
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

export default PagesExportDialog;
