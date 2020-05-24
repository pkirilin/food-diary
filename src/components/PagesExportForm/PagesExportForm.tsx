import React, { useState, useEffect } from 'react';
import './PagesExportForm.scss';
import { Input, Label, FormGroup, DropdownList, Button } from '../Controls';
import { exportFormats } from './export-formats';
import {
  PagesExportFormStateToPropsMapResult,
  PagesExportFormDispatchToPropsMapResult,
} from './PagesExportFormConnected';
import { PagesOperationsActionTypes } from '../../action-types';
import { downloadFile } from '../../utils/file-utils';
import { ExportFormat } from '../../models';

interface PagesExportFormProps extends PagesExportFormStateToPropsMapResult, PagesExportFormDispatchToPropsMapResult {}

const PagesExportForm: React.FC<PagesExportFormProps> = ({
  pageOperationStatus,
  closeModal,
  exportPages,
}: PagesExportFormProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState(ExportFormat.Json);
  const [isInputValid, setIsInputValid] = useState<boolean>();

  useEffect(() => {
    const startDateMs = Date.parse(startDate);
    const endDateMs = Date.parse(endDate);
    setIsInputValid(startDateMs <= endDateMs && exportFormats.includes(format));
  }, [startDate, endDate, format, setIsInputValid]);

  const isInputDisabled = pageOperationStatus.performing;

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
      downloadFile(exportPagesResultAction.exportFile, `FoodDiary_${startDate}_${endDate}.${format}`);
    }
  };

  const handleCancelButtonClick = (): void => {
    closeModal();
  };

  return (
    <div className="pages-export-form">
      <div className="pages-export-form__input">
        <FormGroup>
          <Label>Start date</Label>
          <Input type="date" value={startDate} onChange={handleStartDateChange} disabled={isInputDisabled}></Input>
        </FormGroup>
        <FormGroup>
          <Label>End date</Label>
          <Input type="date" value={endDate} onChange={handleEndDateChange} disabled={isInputDisabled}></Input>
        </FormGroup>
        <FormGroup>
          <Label>Format</Label>
          <DropdownList
            items={exportFormats}
            placeholder="Format"
            inputValue={format}
            onValueSelect={handleFormatValueSelect}
            disabled={isInputDisabled}
          ></DropdownList>
        </FormGroup>
      </div>
      <div className="pages-export-form__buttons">
        <Button onClick={handleExportButtonClick} disabled={isInputDisabled || !isInputValid}>
          Export
        </Button>
        <Button onClick={handleCancelButtonClick} disabled={isInputDisabled}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PagesExportForm;
