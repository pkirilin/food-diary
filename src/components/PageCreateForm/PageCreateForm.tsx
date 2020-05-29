import React, { useState, useEffect } from 'react';
import './PageCreateForm.scss';
import { PageCreateFormStateToPropsMapResult, PageCreateFormDispatchToPropsMapResult } from './PageCreateFormConnected';
import { FormGroup, Label, Input, Button } from '../Controls';
import { PagesOperationsActionTypes } from '../../action-types';
import { usePageValidation } from '../../hooks';
import { ModalButtons } from '../ModalBlocks';

interface PageCreateFormProps extends PageCreateFormStateToPropsMapResult, PageCreateFormDispatchToPropsMapResult {}

const PageCreateForm: React.FC<PageCreateFormProps> = ({
  pageOperationStatus,
  pagesFilter,
  closeModal,
  getDateForNewPage,
  createPage,
  getPages,
}: PageCreateFormProps) => {
  const [date, setDate] = useState('');
  const [isPageDateValid] = usePageValidation(date);

  useEffect(() => {
    const setDateForNewPageAsync = async (): Promise<void> => {
      const action = await getDateForNewPage();

      if (action.type === PagesOperationsActionTypes.DateForNewPageSuccess) {
        setDate(action.dateForNewPage);
      }
    };

    setDateForNewPageAsync();
  }, [setDate, getDateForNewPage]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDate(event.target.value);
  };

  const handleCreateClick = async (): Promise<void> => {
    closeModal();
    await createPage({ date });
    await getPages(pagesFilter);
  };

  const handleCancelClick = (): void => {
    closeModal();
  };

  const isInputDisabled = pageOperationStatus.performing;

  return (
    <React.Fragment>
      <FormGroup>
        <Label>Page date</Label>
        <Input type="date" value={date} onChange={handleDateChange} disabled={isInputDisabled}></Input>
      </FormGroup>
      <ModalButtons>
        <Button onClick={handleCreateClick} disabled={isInputDisabled || !isPageDateValid}>
          Create
        </Button>
        <Button onClick={handleCancelClick}>Cancel</Button>
      </ModalButtons>
    </React.Fragment>
  );
};

export default PageCreateForm;
