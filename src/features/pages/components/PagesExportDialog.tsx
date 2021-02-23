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
import { DialogCustomActionProps } from '../../__shared__/types';
import { ExportFormat } from '../../__shared__/models';
import { ExportPagesRequest } from '../thunks';

interface PagesExportDialogProps extends DialogProps, DialogCustomActionProps<ExportPagesRequest> {}

const initialFormat = ExportFormat.Json;

const PagesExportDialog: React.FC<PagesExportDialogProps> = ({
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: PagesExportDialogProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [format, setFormat] = useState(ExportFormat.Json);

  const handleConfirmClick = (): void => {
    if (startDate && endDate) {
      onDialogConfirm({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format,
      });
    }
  };

  useEffect(() => {
    return () => {
      setStartDate(null);
      setEndDate(null);
      setFormat(initialFormat);
    };
  }, [dialogProps.open]);

  return (
    <Dialog {...dialogProps}>
      <DialogTitle>Export pages</DialogTitle>
      <DialogContent>
        {/* TODO: move utils provider to app-level */}
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            fullWidth
            variant="inline"
            format="dd.MM.yyyy"
            label="Start date"
            value={startDate}
            onChange={date => {
              setStartDate(date);
            }}
          />
          <KeyboardDatePicker
            disableToolbar
            fullWidth
            variant="inline"
            format="dd.MM.yyyy"
            margin="normal"
            label="End date"
            value={endDate}
            onChange={date => {
              setEndDate(date);
            }}
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
        <Button variant="contained" color="primary" onClick={handleConfirmClick}>
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
