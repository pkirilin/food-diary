import React, { useState, useEffect } from 'react';
import './PageCreateForm.scss';
import { PageCreateFormStateToPropsMapResult, PageCreateFormDispatchToPropsMapResult } from './PageCreateFormConnected';
import { Label, Input, Button, Container } from '../__ui__';
import { PagesOperationsActionTypes } from '../../action-types';
import { usePageValidation } from '../../hooks';

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
    <Container direction="column" spaceBetweenChildren="large">
      <Container direction="column">
        <Label>Page date</Label>
        <Input type="date" value={date} onChange={handleDateChange} disabled={isInputDisabled}></Input>
      </Container>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          <Button onClick={handleCreateClick} disabled={isInputDisabled || !isPageDateValid}>
            Create
          </Button>
        </Container>
        <Container col="4">
          <Button variant="text" onClick={handleCancelClick}>
            Cancel
          </Button>
        </Container>
      </Container>
    </Container>
  );
};

export default PageCreateForm;
