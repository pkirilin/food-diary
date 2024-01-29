import { type FC, useEffect, type FormEventHandler } from 'react';
import { AppButton, AppDialog, DatePicker } from 'src/components';
import { useInput } from 'src/hooks';
import { mapToDateInputProps } from 'src/utils/inputMapping';
import { validateDate } from 'src/utils/validation';
import { useExportToGoogleDocs } from '../hooks/useExportToGoogleDocs';
import { useExportToJson } from '../hooks/useExportToJson';
import { type ExportFormat } from '../models';

interface ExportDialogProps {
  format: ExportFormat;
  isOpen: boolean;
  onClose: () => void;
}

const ExportDialog: FC<ExportDialogProps> = ({ format: exportFormat, isOpen, onClose }) => {
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

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (exportFormat === 'json') {
      void exportToJson.start();
    } else {
      void exportToGoogleDocs.start();
    }
  };

  return (
    <AppDialog
      title="Export pages"
      isOpened={isOpen}
      content={
        <form id="export-form" onSubmit={handleSubmit}>
          <DatePicker
            {...startDateInput.inputProps}
            label="Start date"
            placeholder="Select start date"
          />
          <DatePicker {...endDateInput.inputProps} label="End date" placeholder="Select end date" />
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="export-form"
          variant="contained"
          color="primary"
          isLoading={isExportLoading}
          disabled={isExportDisabled}
        >
          {exportSubmitText}
        </AppButton>
      }
      actionCancel={
        <AppButton type="button" variant="text" onClick={onClose}>
          Cancel
        </AppButton>
      }
      onClose={onClose}
    />
  );
};

export default ExportDialog;
