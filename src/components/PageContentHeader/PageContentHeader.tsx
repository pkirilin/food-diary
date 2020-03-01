import React from 'react';
import './PageContentHeader.scss';
import { StateToPropsMapResult } from './PageContentHeaderConnected';
import Icon from '../Icon';
import { useParams, NavLink } from 'react-router-dom';
import MealsControlPanelConnected from '../MealsControlPanel/MealsControlPanelConnected';
import Loader from '../Loader';

type PageContentHeaderProps = StateToPropsMapResult;

const PageContentHeader: React.FC<PageContentHeaderProps> = ({
  pageDate,
  visiblePagesIds,
  isPageContentLoading,
}: PageContentHeaderProps) => {
  const { id: currentPageIdFromRoute } = useParams();
  const currentPageId = currentPageIdFromRoute !== undefined ? +currentPageIdFromRoute : 0;
  const currentPageIndex = visiblePagesIds.findIndex(id => id === currentPageId);

  const isPreviousPageExists = currentPageIndex > 0;
  const isNextPageExists = currentPageIndex > -1 && currentPageIndex < visiblePagesIds.length - 1;

  const isPreviousPageIconActive = isPreviousPageExists && !isPageContentLoading;
  const isNextPageIconActive = isNextPageExists && !isPageContentLoading;

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
            <div className="page-content-header__navigation__date">{pageDate}</div>
          )}
          {isNextPageIconActive ? <NavLink to={`/pages/${nextPageId}`}>{nextPageIcon}</NavLink> : nextPageIcon}
        </div>
      </div>
      <MealsControlPanelConnected></MealsControlPanelConnected>
    </div>
  );
};

export default PageContentHeader;
