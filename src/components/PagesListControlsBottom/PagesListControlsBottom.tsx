import React from 'react';
import './PagesListControlsBottom.scss';
import { IconSortDescending } from '../Icons';
import { Label, Dropdown, DropdownItem, FormGroup } from '../Controls';

const PagesListControlsBottom: React.FC = () => {
  return (
    <div className="pages-list-controls-bottom">
      <IconSortDescending></IconSortDescending>
      <FormGroup inline>
        <Label>Show</Label>
        <div className="pages-list-controls-bottom__show-count-wrapper">
          <Dropdown initialSelectedValue="30" toggleDirection="top">
            <DropdownItem>7</DropdownItem>
            <DropdownItem>30</DropdownItem>
            <DropdownItem>60</DropdownItem>
            <DropdownItem>90</DropdownItem>
            <DropdownItem>120</DropdownItem>
            <DropdownItem>365</DropdownItem>
            <DropdownItem>All</DropdownItem>
          </Dropdown>
        </div>
      </FormGroup>
    </div>
  );
};

export default PagesListControlsBottom;
