import React from 'react';
import './PageContentHeader.scss';
import { StateToPropsMapResult } from './PageContentHeaderConnected';
import Icon from '../Icon';
import { useParams, NavLink } from 'react-router-dom';
import MealsControlPanelConnected from '../MealsControlPanel/MealsControlPanelConnected';
import Loader from '../Loader';

type PageContentHeaderProps = StateToPropsMapResult;

const PageContentHeader: React.FC<PageContentHeaderProps> = ({
  pageItems,
  isPageContentLoading,
  isPageOperationInProcess,
}: PageContentHeaderProps) => {
  const { id: currentPageIdFromRoute } = useParams();
  const currentPageId = currentPageIdFromRoute !== undefined ? +currentPageIdFromRoute : 0;
  const visiblePagesIds = pageItems.map(p => p.id);
  const currentSelectedPage = pageItems.find(p => p.id === currentPageId);
  const currentPageIndex = pageItems.findIndex(p => p.id === currentPageId);
  const isAnyDraftPageExists = visiblePagesIds.some(id => id < 1);

  const isPreviousPageExists = !(currentPageIndex === 1 && isAnyDraftPageExists) && currentPageIndex > 0;
  const isNextPageExists = currentPageIndex > -1 && currentPageIndex < visiblePagesIds.length - 1;

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
              {currentSelectedPage && currentSelectedPage.date}
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
