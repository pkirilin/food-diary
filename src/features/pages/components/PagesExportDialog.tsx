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
import { useValidatedDateInput } from '../../__shared__/hooks';
import { ExportFormat } from '../../__shared__/models';
import { DialogCustomActionProps } from '../../__shared__/types';
import { ExportPagesRequest } from '../thunks';
import { createDateValidator } from '../../__shared__/validators';

interface PagesExportDialogProps extends DialogProps, DialogCustomActionProps<ExportPagesRequest> {}

const initialFormat = ExportFormat.Json;
const validateDate = createDateValidator(false);

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
  const [format, setFormat] = useState(ExportFormat.Json);

  const isExportDisabled = !isValidStartDate || !isValidEndDate;

  const getDateStringWithoutTime = (date: Date): string => {
    return date.toISOString().slice(0, 10);
  };

  const handleConfirmClick = (): void => {
    if (startDate && endDate) {
      onDialogConfirm({
        startDate: getDateStringWithoutTime(startDate),
        endDate: getDateStringWithoutTime(endDate),
        format,
      });
    }
  };

  useEffect(() => {
    if (dialogProps.open) {
      setStartDate(null);
      setEndDate(null);
      setFormat(initialFormat);
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
            disableToolbar
            fullWidth
            variant="inline"
            format="dd.MM.yyyy"
            label="Start date"
          />
          <KeyboardDatePicker
            {...bindEndDate()}
            disableToolbar
            fullWidth
            variant="inline"
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
            value={format}
            onChange={event => {
              setFormat(event.target.value as ExportFormat);
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
