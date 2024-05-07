import { type FC, useEffect, type FormEventHandler } from 'react';
import { useInput } from '@/shared/hooks';
import { mapToDateInputProps, validateDate } from '@/shared/lib';
import { Button, AppDialog, DatePicker } from '@/shared/ui';
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
        <Button
          type="submit"
          form="export-form"
          variant="text"
          color="primary"
          loading={isExportLoading}
          disabled={isExportDisabled}
        >
          {exportSubmitText}
        </Button>
      }
      actionCancel={
        <Button
          type="button"
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={isExportLoading}
        >
          Cancel
        </Button>
      }
      onClose={onClose}
    />
  );
};

export default ExportDialog;
