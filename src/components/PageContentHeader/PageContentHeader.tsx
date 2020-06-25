import React from 'react';
import './PageContentHeader.scss';
import { PageContentHeaderStateToPropsMapResult } from './PageContentHeaderConnected';
import { NavLink } from 'react-router-dom';
import MealsControlPanelConnected from '../MealsControlPanel/MealsControlPanelConnected';
import { formatDateStr, DateFormat } from '../../utils';
import { useIdFromRoute } from '../../hooks';
import { Icon } from '../__ui__';

type PageContentHeaderProps = PageContentHeaderStateToPropsMapResult;

const PageContentHeader: React.FC<PageContentHeaderProps> = ({
  pageItems,
  isPageContentLoading,
  isPageOperationInProcess,
}: PageContentHeaderProps) => {
  const pageId = useIdFromRoute();

  const visiblePagesIds = pageItems.map(p => p.id);
  const currentSelectedPage = pageItems.find(p => p.id === pageId);
  const currentPageIndex = pageItems.findIndex(p => p.id === pageId);

  const isPreviousPageExists = currentPageIndex > 0;
  const isNextPageExists = currentPageIndex >= 0 && currentPageIndex < visiblePagesIds.length - 1;

  const isPreviousPageIconActive = isPreviousPageExists && !isPageContentLoading && !isPageOperationInProcess;
  const isNextPageIconActive = isNextPageExists && !isPageContentLoading && !isPageOperationInProcess;

  const previousPageId = visiblePagesIds[currentPageIndex - 1];
  const nextPageId = visiblePagesIds[currentPageIndex + 1];

  const previousPageLinkClassNames: string[] = [];
  const nextPageLinkClassNames: string[] = [];

  if (!isPreviousPageIconActive) {
    previousPageLinkClassNames.push('page-content-header__navigation_disabled');
  }

  if (!isNextPageIconActive) {
    nextPageLinkClassNames.push('page-content-header__navigation_disabled');
  }

  return (
    <div className="page-content-header">
      <div className="page-content-header__navigation-wrapper">
        <div className="page-content-header__navigation">
          <NavLink to={`/pages/${previousPageId}`} className={previousPageLinkClassNames.join(' ')}>
            <Icon
              type="next-arrow"
              title="Navigate to the previous page"
              svgStyle={{
                width: '25px',
                height: '25px',
                transform: 'rotate(180deg)',
              }}
              disabled={!isPreviousPageIconActive}
            ></Icon>
          </NavLink>
          <div className="page-content-header__navigation__date">
            {currentSelectedPage && formatDateStr(currentSelectedPage.date, DateFormat.SlashDMY)}
          </div>
          <NavLink to={`/pages/${nextPageId}`} className={nextPageLinkClassNames.join(' ')}>
            <Icon
              type="next-arrow"
              title="Navigate to the next page"
              svgStyle={{
                width: '25px',
                height: '25px',
              }}
              disabled={!isNextPageIconActive}
            ></Icon>
          </NavLink>
        </div>
      </div>
      <MealsControlPanelConnected></MealsControlPanelConnected>
    </div>
  );
};

export default PageContentHeader;
