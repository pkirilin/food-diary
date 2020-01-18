import React from 'react';
import './PagesListControlsBottom.scss';
import { IconSortDescending, IconSortAscending } from '../Icons';
import { Label, Dropdown, DropdownItem, FormGroup } from '../Controls';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListControlsBottomConnected';
import { SortOrder, ShowCount } from '../../models';

interface PagesListControlsBottomProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesListControlsBottom: React.FC<PagesListControlsBottomProps> = ({
  pagesFilter,
  toggleSortOrder,
}: PagesListControlsBottomProps) => {
  const clickSortIcon = (): void => {
    toggleSortOrder(pagesFilter);
  };

  return (
    <div className="pages-list-controls-bottom">
      {pagesFilter.sortOrder === SortOrder.Ascending ? (
        <IconSortAscending onClick={clickSortIcon}></IconSortAscending>
      ) : (
        <IconSortDescending onClick={clickSortIcon}></IconSortDescending>
      )}
      <FormGroup inline>
        <Label>Show</Label>
        <div className="pages-list-controls-bottom__show-count-wrapper">
          <Dropdown initialSelectedValue={ShowCount.LastMonth.toString()} toggleDirection="top">
            <DropdownItem>{ShowCount.LastWeek}</DropdownItem>
            <DropdownItem>{ShowCount.LastMonth}</DropdownItem>
            <DropdownItem>{ShowCount.LastTwoMonths}</DropdownItem>
            <DropdownItem>{ShowCount.LastThreeMonths}</DropdownItem>
            <DropdownItem>{ShowCount.LastHalfYear}</DropdownItem>
            <DropdownItem>{ShowCount.LastYear}</DropdownItem>
            <DropdownItem>All</DropdownItem>
          </Dropdown>
        </div>
      </FormGroup>
    </div>
  );
};

export default PagesListControlsBottom;
