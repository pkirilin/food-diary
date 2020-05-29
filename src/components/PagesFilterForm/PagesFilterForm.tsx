import React, { useState, useEffect } from 'react';
import './PagesFilterForm.scss';
import {
  PagesFilterFormDispatchToPropsMapResult,
  PagesFilterFormStateToPropsMapResult,
} from './PagesFilterFormConnected';
import { Button, FormGroup, Label, Input } from '../Controls';
import { ModalButtons } from '../ModalBlocks';

interface PagesFilterFormProps extends PagesFilterFormStateToPropsMapResult, PagesFilterFormDispatchToPropsMapResult {}

const PagesFilterForm: React.FC<PagesFilterFormProps> = ({
  pagesFilter,
  closeModal,
  updatePagesFilter,
}: PagesFilterFormProps) => {
  const { startDate: filterStartDate, endDate: filterEndDate } = pagesFilter;

  const [startDate, setStartDate] = useState(filterStartDate ? filterStartDate : '');
  const [endDate, setEndDate] = useState(filterEndDate ? filterEndDate : '');
  const [areDateRangesValid, setAreDateRangesValid] = useState<boolean>();

  useEffect(() => {
    if (startDate && endDate) {
      setAreDateRangesValid(Date.parse(startDate) <= Date.parse(endDate));
    } else {
      setAreDateRangesValid(true);
    }
  }, [startDate, endDate, setAreDateRangesValid]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEndDate(event.target.value);
  };

  const handleApplyClick = (): void => {
    closeModal();
    updatePagesFilter({
      ...pagesFilter,
      startDate,
      endDate,
    });
  };

  const handleCancelClick = (): void => {
    closeModal();
  };

  return (
    <div className="pages-filter-form">
      <FormGroup>
        <Label>Start date</Label>
        <Input type="date" value={startDate} onChange={handleStartDateChange}></Input>
      </FormGroup>
      <FormGroup>
        <Label>End date</Label>
        <Input type="date" value={endDate} onChange={handleEndDateChange}></Input>
      </FormGroup>
      <ModalButtons>
        <Button onClick={handleApplyClick} disabled={!areDateRangesValid}>
          Apply
        </Button>
        <Button onClick={handleCancelClick}>Cancel</Button>
      </ModalButtons>
    </div>
  );
};

export default PagesFilterForm;
