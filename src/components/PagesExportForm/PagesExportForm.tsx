import React from 'react';
import './PagesExportForm.scss';
import { Input, Label, FormGroup, DropdownList, Button } from '../Controls';
import { exportFormats } from './export-formats';

interface PagesExportFormProps {
  test?: string;
}

const PagesExportForm: React.FC<PagesExportFormProps> = () => {
  return (
    <div className="pages-export-form">
      <div className="pages-export-form__input">
        <FormGroup>
          <Label>Start date</Label>
          <Input type="date"></Input>
        </FormGroup>
        <FormGroup>
          <Label>End date</Label>
          <Input type="date"></Input>
        </FormGroup>
        <FormGroup>
          <Label>Format</Label>
          <DropdownList items={exportFormats} placeholder="Format"></DropdownList>
        </FormGroup>
      </div>
      <div className="pages-export-form__buttons">
        <Button>Export</Button>
        <Button>Cancel</Button>
      </div>
    </div>
  );
};

export default PagesExportForm;
