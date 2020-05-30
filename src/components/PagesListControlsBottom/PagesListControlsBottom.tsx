import React from 'react';
import './PagesListControlsBottom.scss';
import {
  PagesListControlsBottomDispatchToPropsMapResult,
  PagesListControlsBottomStateToPropsMapResult,
} from './PagesListControlsBottomConnected';
import { SortOrder } from '../../models';
import Icon from '../Icon';
import { invertSortOrder, formatDateStr, DateFormat } from '../../utils';

interface PagesListControlsBottomProps
  extends PagesListControlsBottomStateToPropsMapResult,
    PagesListControlsBottomDispatchToPropsMapResult {}

const PagesListControlsBottom: React.FC<PagesListControlsBottomProps> = ({
  pagesFilter,
  updatePagesFilter,
  arePagesLoading,
  areNotesForPageLoading,
  areNotesForMealLoading,
  isPageOperationInProcess,
  isNoteOperationInProcess,
}: PagesListControlsBottomProps) => {
  const isControlDisabled =
    arePagesLoading ||
    areNotesForMealLoading ||
    areNotesForPageLoading ||
    isPageOperationInProcess ||
    isNoteOperationInProcess;

  const handleSortIconClick = (): void => {
    updatePagesFilter({ ...pagesFilter, sortOrder: invertSortOrder(pagesFilter.sortOrder) });
  };

  const { startDate, endDate, sortOrder } = pagesFilter;
  const visibleRangesClassNames = ['pages-list-controls-bottom__visible-ranges'];

  if (startDate && endDate) {
    visibleRangesClassNames.push('pages-list-controls-bottom__visible-ranges_small');
  }

  return (
    <div className="pages-list-controls-bottom">
      {sortOrder === SortOrder.Ascending ? (
        <Icon type="sort-ascending" label="Sort" onClick={handleSortIconClick} disabled={isControlDisabled}></Icon>
      ) : (
        <Icon type="sort-descending" label="Sort" onClick={handleSortIconClick} disabled={isControlDisabled}></Icon>
      )}
      <div className="pages-list-controls-bottom__divider"></div>
      <div className={visibleRangesClassNames.join(' ')}>
        {!startDate && !endDate && <div>All pages visible</div>}
        {startDate && !endDate && (
          <React.Fragment>
            <div>Pages since:</div>
            <div>{formatDateStr(startDate, DateFormat.SlashDMY)}</div>
          </React.Fragment>
        )}
        {!startDate && endDate && (
          <React.Fragment>
            <div>Pages until:</div>
            <div>{formatDateStr(endDate, DateFormat.SlashDMY)}</div>
          </React.Fragment>
        )}
        {startDate && endDate && (
          <React.Fragment>
            <div>Pages period:</div>
            <div>
              {formatDateStr(startDate, DateFormat.SlashDMY)} - {formatDateStr(endDate, DateFormat.SlashDMY)}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default PagesListControlsBottom;
