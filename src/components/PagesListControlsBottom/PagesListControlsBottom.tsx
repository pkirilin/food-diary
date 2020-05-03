import React, { useState, useEffect } from 'react';
import './PagesListControlsBottom.scss';
import { Label, FormGroup, DropdownList } from '../Controls';
import {
  PagesListControlsBottomDispatchToPropsMapResult,
  PagesListControlsBottomStateToPropsMapResult,
} from './PagesListControlsBottomConnected';
import { SortOrder, ShowCount } from '../../models';
import Icon from '../Icon';
import { showCountAllString, invertSortOrder } from '../../utils/filter-utils';

interface PagesListControlsBottomProps
  extends PagesListControlsBottomStateToPropsMapResult,
    PagesListControlsBottomDispatchToPropsMapResult {}

const showCountDropdownItems: string[] = [
  ShowCount.LastWeek.toString(),
  ShowCount.LastMonth.toString(),
  ShowCount.LastTwoMonths.toString(),
  ShowCount.LastThreeMonths.toString(),
  ShowCount.LastHalfYear.toString(),
  ShowCount.LastYear.toString(),
  showCountAllString,
];

const PagesListControlsBottom: React.FC<PagesListControlsBottomProps> = ({
  pagesFilter,
  updatePagesFilter,
  arePagesLoading,
  areNotesForPageLoading,
  areNotesForMealLoading,
  isPageOperationInProcess,
  isNoteOperationInProcess,
}: PagesListControlsBottomProps) => {
  const [showCountInputValue, setShowCountInputValue] = useState(showCountAllString);

  const isControlDisabled =
    arePagesLoading ||
    areNotesForMealLoading ||
    areNotesForPageLoading ||
    isPageOperationInProcess ||
    isNoteOperationInProcess;

  useEffect(() => {
    setShowCountInputValue(pagesFilter.showCount ? pagesFilter.showCount.toString() : showCountAllString);
  }, [pagesFilter]);

  const handleSortIconClick = (): void => {
    updatePagesFilter({ ...pagesFilter, sortOrder: invertSortOrder(pagesFilter.sortOrder) });
  };

  const handleShowCountDropdownValueSelect = (newSelectedValueIndex: number): void => {
    let showCount: number;
    const newSelectedValue = showCountDropdownItems[newSelectedValueIndex];
    setShowCountInputValue(showCountDropdownItems[newSelectedValueIndex]);
    if (!isNaN((showCount = Number(newSelectedValue)))) {
      updatePagesFilter({ ...pagesFilter, showCount });
    } else if (newSelectedValue === showCountAllString) {
      updatePagesFilter({ ...pagesFilter, showCount: undefined });
    }
  };

  return (
    <div className="pages-list-controls-bottom">
      {pagesFilter.sortOrder === SortOrder.Ascending ? (
        <Icon type="sort-ascending" onClick={handleSortIconClick} disabled={isControlDisabled}></Icon>
      ) : (
        <Icon type="sort-descending" onClick={handleSortIconClick} disabled={isControlDisabled}></Icon>
      )}
      <FormGroup inline>
        <Label>Show</Label>
        <div className="pages-list-controls-bottom__show-count-wrapper">
          <DropdownList
            items={showCountDropdownItems}
            toggleDirection="top"
            disabled={isControlDisabled}
            inputValue={showCountInputValue}
            onValueSelect={handleShowCountDropdownValueSelect}
          ></DropdownList>
        </div>
      </FormGroup>
    </div>
  );
};

export default PagesListControlsBottom;
