import React from 'react';
import './PagesListControlsBottom.scss';
import { Label, DropdownList, DropdownItem, FormGroup } from '../Controls';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListControlsBottomConnected';
import { SortOrder, ShowCount, invertSortOrder } from '../../models';
import Icon from '../Icon';

interface PagesListControlsBottomProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesListControlsBottom: React.FC<PagesListControlsBottomProps> = ({
  pagesFilter,
  updatePagesFilter,
  pagesLoaded,
}: PagesListControlsBottomProps) => {
  const handleSortIconClick = (): void => {
    updatePagesFilter({ ...pagesFilter, sortOrder: invertSortOrder(pagesFilter.sortOrder) });
  };

  const handleShowCountDropdownValueChanged = (newSelectedValue: string): void => {
    let showCount: number;
    if (!isNaN((showCount = Number(newSelectedValue)))) {
      updatePagesFilter({ ...pagesFilter, showCount });
    }
    // TODO: remove hardcode
    else if (newSelectedValue === 'All') {
      updatePagesFilter({ ...pagesFilter, showCount: undefined });
    }
  };

  return (
    <div className="pages-list-controls-bottom">
      {pagesFilter.sortOrder === SortOrder.Ascending ? (
        <Icon type="sort-ascending" onClick={handleSortIconClick} disabled={!pagesLoaded}></Icon>
      ) : (
        <Icon type="sort-descending" onClick={handleSortIconClick} disabled={!pagesLoaded}></Icon>
      )}
      <FormGroup inline>
        <Label>Show</Label>
        <div className="pages-list-controls-bottom__show-count-wrapper">
          <DropdownList
            onValueChanged={handleShowCountDropdownValueChanged}
            initialSelectedValue={pagesFilter.showCount === undefined ? 'All' : pagesFilter.showCount.toString()}
            toggleDirection="top"
            disabled={!pagesLoaded}
          >
            <DropdownItem>{ShowCount.LastWeek}</DropdownItem>
            <DropdownItem>{ShowCount.LastMonth}</DropdownItem>
            <DropdownItem>{ShowCount.LastTwoMonths}</DropdownItem>
            <DropdownItem>{ShowCount.LastThreeMonths}</DropdownItem>
            <DropdownItem>{ShowCount.LastHalfYear}</DropdownItem>
            <DropdownItem>{ShowCount.LastYear}</DropdownItem>
            <DropdownItem>All</DropdownItem>
          </DropdownList>
        </div>
      </FormGroup>
    </div>
  );
};

export default PagesListControlsBottom;
