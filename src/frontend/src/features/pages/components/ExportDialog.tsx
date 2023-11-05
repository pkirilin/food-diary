import React, { useEffect } from 'react';
import { AppButton, AppDialog, DatePicker } from 'src/components';
import { useInput } from 'src/hooks';
import { mapToDateInputProps } from 'src/utils/inputMapping';
import { validateDate } from 'src/utils/validation';
import { useExportToGoogleDocs } from '../hooks/useExportToGoogleDocs';
import { useExportToJson } from '../hooks/useExportToJson';
import { ExportFormat } from '../models';

type ExportDialogProps = {
  format: ExportFormat;
  isOpen: boolean;
  onClose: () => void;
};

const ExportDialog: React.FC<ExportDialogProps> = ({ format: exportFormat, isOpen, onClose }) => {
  const startDateInput = useInput({
    initialValue: null,
    errorHelperText: 'Start date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
  });

  const endDateInput = useInput({
    initialValue: null,
    errorHelperText: 'End date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
  });

  const exportToJson = useExportToJson(startDateInput.value, endDateInput.value, onClose);
  const exportToGoogleDocs = useExportToGoogleDocs(
    startDateInput.value,
    endDateInput.value,
    onClose,
  );

  const clearStartDate = startDateInput.clearValue;
  const clearEndDate = endDateInput.clearValue;

  useEffect(() => {
    if (!isOpen) {
      clearStartDate();
      clearEndDate();
    }
  }, [isOpen, clearStartDate, clearEndDate]);

  const isExportDisabled =
    startDateInput.isInvalid ||
    endDateInput.isInvalid ||
    !startDateInput.isTouched ||
    !endDateInput.isTouched;

  const isExportLoading =
    exportFormat === 'json' ? exportToJson.isLoading : exportToGoogleDocs.isLoading;
  const exportSubmitText = exportFormat === 'json' ? 'Export to JSON' : 'Export to Google Docs';

  const handleExportStart = (): void => {
    if (exportFormat === 'json') {
      exportToJson.start();
    } else {
      exportToGoogleDocs.start();
    }
  };

  return (
    <AppDialog
      title="Export pages"
      isOpened={isOpen}
      content={
        <>
          <DatePicker
            {...startDateInput.inputProps}
            label="Start date"
            placeholder="Select start date"
          />
          <DatePicker {...endDateInput.inputProps} label="End date" placeholder="Select end date" />
        </>
      }
      actionSubmit={
        <AppButton
          isLoading={isExportLoading}
          variant="contained"
          color="primary"
          onClick={handleExportStart}
          disabled={isExportDisabled}
        >
          {exportSubmitText}
        </AppButton>
      }
      actionCancel={
        <AppButton variant="text" onClick={onClose}>
          Cancel
        </AppButton>
      }
      onClose={onClose}
    />
  );
};

export default ExportDialog;
