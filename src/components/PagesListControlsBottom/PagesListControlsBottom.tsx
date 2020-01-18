import React from 'react';
import './PagesListControlsBottom.scss';
import { IconSortDescending, IconSortAscending } from '../Icons';
import { Label, Dropdown, DropdownItem, FormGroup } from '../Controls';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListControlsBottomConnected';
import { SortOrder, ShowCount, invertSortOrder } from '../../models';

interface PagesListControlsBottomProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesListControlsBottom: React.FC<PagesListControlsBottomProps> = ({
  pagesFilter,
  updatePagesFilter,
}: PagesListControlsBottomProps) => {
  const handleSortIconClick = (): void => {
    updatePagesFilter({ ...pagesFilter, sortOrder: invertSortOrder(pagesFilter.sortOrder) });
  };

  const handleShowCountClick = (event: React.MouseEvent): void => {
    const target = event.target as HTMLElement;
    let showCount: number;
    if (target && !isNaN((showCount = Number(target.innerText)))) {
      updatePagesFilter({ ...pagesFilter, showCount });
    }
  };

  const handleShowCountAllClick = (): void => {
    updatePagesFilter({ ...pagesFilter, showCount: undefined });
  };

  return (
    <div className="pages-list-controls-bottom">
      {pagesFilter.sortOrder === SortOrder.Ascending ? (
        <IconSortAscending onClick={handleSortIconClick}></IconSortAscending>
      ) : (
        <IconSortDescending onClick={handleSortIconClick}></IconSortDescending>
      )}
      <FormGroup inline>
        <Label>Show</Label>
        <div className="pages-list-controls-bottom__show-count-wrapper">
          <Dropdown initialSelectedValue={ShowCount.LastMonth.toString()} toggleDirection="top">
            <DropdownItem onClick={handleShowCountClick}>{ShowCount.LastWeek}</DropdownItem>
            <DropdownItem onClick={handleShowCountClick}>{ShowCount.LastMonth}</DropdownItem>
            <DropdownItem onClick={handleShowCountClick}>{ShowCount.LastTwoMonths}</DropdownItem>
            <DropdownItem onClick={handleShowCountClick}>{ShowCount.LastThreeMonths}</DropdownItem>
            <DropdownItem onClick={handleShowCountClick}>{ShowCount.LastHalfYear}</DropdownItem>
            <DropdownItem onClick={handleShowCountClick}>{ShowCount.LastYear}</DropdownItem>
            <DropdownItem onClick={handleShowCountAllClick}>All</DropdownItem>
          </Dropdown>
        </div>
      </FormGroup>
    </div>
  );
};

export default PagesListControlsBottom;
