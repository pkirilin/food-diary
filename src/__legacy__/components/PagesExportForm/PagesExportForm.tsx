import React, { useState, useEffect } from 'react';
import './PagesExportForm.scss';
import { Input, Label, DropdownList, Button, Container } from '../__ui__';
import { exportFormats } from './export-formats';
import {
  PagesExportFormStateToPropsMapResult,
  PagesExportFormDispatchToPropsMapResult,
} from './PagesExportFormConnected';
import { PagesOperationsActionTypes } from '../../action-types';
import { downloadFile } from '../../utils';
import { ExportFormat } from '../../models';
import { useFocus } from '../../hooks';

interface PagesExportFormProps extends PagesExportFormStateToPropsMapResult, PagesExportFormDispatchToPropsMapResult {}

const PagesExportForm: React.FC<PagesExportFormProps> = ({
  pageOperationStatus,
  closeModal,
  exportPages,
}: PagesExportFormProps) => {
  const { performing: isInputDisabled } = pageOperationStatus;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState(ExportFormat.Json);
  const [isInputValid, setIsInputValid] = useState<boolean>();
  const elementToFocusRef = useFocus<HTMLInputElement>();

  useEffect(() => {
    const startDateMs = Date.parse(startDate);
    const endDateMs = Date.parse(endDate);
    setIsInputValid(startDateMs <= endDateMs && exportFormats.includes(format));
  }, [startDate, endDate, format, setIsInputValid]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEndDate(event.target.value);
  };

  const handleFormatValueSelect = (newSelectedValueIndex: number): void => {
    setFormat(exportFormats[newSelectedValueIndex]);
  };

  const handleExportButtonClick = async (): Promise<void> => {
    closeModal();

    const exportPagesResultAction = await exportPages({
      startDate,
      endDate,
      format,
    });

    if (exportPagesResultAction.type === PagesOperationsActionTypes.ExportSuccess) {
      downloadFile(exportPagesResultAction.data, `FoodDiary_${startDate}_${endDate}.${format}`);
    }
  };

  const handleCancelButtonClick = (): void => {
    closeModal();
  };

  return (
    <Container direction="column" spaceBetweenChildren="large">
      <Container direction="column" spaceBetweenChildren="medium">
        <Container direction="column">
          <Label>Start date</Label>
          <Input type="date" value={startDate} onChange={handleStartDateChange} disabled={isInputDisabled}></Input>
        </Container>
        <Container direction="column">
          <Label>End date</Label>
          <Input type="date" value={endDate} onChange={handleEndDateChange} disabled={isInputDisabled}></Input>
        </Container>
        <Container direction="column">
          <Label>Format</Label>
          <DropdownList
            items={exportFormats}
            placeholder="Format"
            inputValue={format}
            onValueSelect={handleFormatValueSelect}
            disabled={isInputDisabled}
          ></DropdownList>
        </Container>
      </Container>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          <Button onClick={handleExportButtonClick} disabled={isInputDisabled || !isInputValid}>
            Export
          </Button>
        </Container>
        <Container col="4">
          <Button
            inputRef={elementToFocusRef}
            variant="text"
            onClick={handleCancelButtonClick}
            disabled={isInputDisabled}
          >
            Cancel
          </Button>
        </Container>
      </Container>
    </Container>
  );
};

export default PagesExportForm;
