import React from 'react';
import './PageContentHeader.scss';
import { PageContentHeaderStateToPropsMapResult } from './PageContentHeaderConnected';
import Icon from '../Icon';
import { useParams, NavLink } from 'react-router-dom';
import MealsControlPanelConnected from '../MealsControlPanel/MealsControlPanelConnected';
import Loader from '../Loader';
import { getFormattedDate } from '../../utils/date-utils';

type PageContentHeaderProps = PageContentHeaderStateToPropsMapResult;

const PageContentHeader: React.FC<PageContentHeaderProps> = ({
  pageItems,
  isPageContentLoading,
  isPageOperationInProcess,
}: PageContentHeaderProps) => {
  const { id: currentPageIdFromRoute } = useParams();
  const currentPageId = currentPageIdFromRoute ? +currentPageIdFromRoute : 0;
  const visiblePagesIds = pageItems.map(p => p.id);
  const currentSelectedPage = pageItems.find(p => p.id === currentPageId);
  const currentPageIndex = pageItems.findIndex(p => p.id === currentPageId);

  const isPreviousPageExists = currentPageIndex > 0;
  const isNextPageExists = currentPageIndex >= 0 && currentPageIndex < visiblePagesIds.length - 1;

  const isPreviousPageIconActive = isPreviousPageExists && !isPageContentLoading && !isPageOperationInProcess;
  const isNextPageIconActive = isNextPageExists && !isPageContentLoading && !isPageOperationInProcess;

  const previousPageId = visiblePagesIds[currentPageIndex - 1];
  const nextPageId = visiblePagesIds[currentPageIndex + 1];

  const previousPageIcon = (
    <Icon
      type="next-arrow"
      svgStyle={{
        width: '25px',
        height: '25px',
        transform: 'rotate(180deg)',
      }}
      disabled={!isPreviousPageIconActive}
    ></Icon>
  );

  const nextPageIcon = (
    <Icon
      type="next-arrow"
      svgStyle={{
        width: '25px',
        height: '25px',
      }}
      disabled={!isNextPageIconActive}
    ></Icon>
  );

  return (
    <div className="page-content-header">
      <div className="page-content-header__navigation-wrapper">
        <div className="page-content-header__navigation">
          {isPreviousPageIconActive ? (
            <NavLink to={`/pages/${previousPageId}`}>{previousPageIcon}</NavLink>
          ) : (
            previousPageIcon
          )}
          {isPageContentLoading ? (
            <Loader size="small" label="Loading date"></Loader>
          ) : (
            <div className="page-content-header__navigation__date">
              {currentSelectedPage && getFormattedDate(currentSelectedPage.date)}
            </div>
          )}
          {isNextPageIconActive ? <NavLink to={`/pages/${nextPageId}`}>{nextPageIcon}</NavLink> : nextPageIcon}
        </div>
      </div>
      <MealsControlPanelConnected></MealsControlPanelConnected>
    </div>
  );
};

export default PageContentHeader;
