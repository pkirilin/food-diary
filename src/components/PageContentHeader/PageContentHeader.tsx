import React from 'react';
import './PageContentHeader.scss';
import { StateToPropsMapResult } from './PageContentHeaderConnected';
import Icon from '../Icon';
import { useParams, NavLink } from 'react-router-dom';
import MealsControlPanelConnected from '../MealsControlPanel/MealsControlPanelConnected';

type PageContentHeaderProps = StateToPropsMapResult;

const PageContentHeader: React.FC<PageContentHeaderProps> = ({ pageDate, visiblePagesIds }: PageContentHeaderProps) => {
  const { id: currentPageIdFromRoute } = useParams();
  const currentPageId = currentPageIdFromRoute !== undefined ? +currentPageIdFromRoute : 0;
  const currentPageIndex = visiblePagesIds.findIndex(id => id === currentPageId);

  const isPreviousPageExists = currentPageIndex > 0;
  const isNextPageExists = currentPageIndex > -1 && currentPageIndex < visiblePagesIds.length - 1;

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
      disabled={!isPreviousPageExists}
    ></Icon>
  );

  const nextPageIcon = (
    <Icon
      type="next-arrow"
      svgStyle={{
        width: '25px',
        height: '25px',
      }}
      disabled={!isNextPageExists}
    ></Icon>
  );

  return (
    <div className="page-content-header">
      {isPreviousPageExists ? <NavLink to={`/pages/${previousPageId}`}>{previousPageIcon}</NavLink> : previousPageIcon}
      <div className="page-content-header__date">{pageDate}</div>
      {isNextPageExists ? <NavLink to={`/pages/${nextPageId}`}>{nextPageIcon}</NavLink> : nextPageIcon}
      <MealsControlPanelConnected></MealsControlPanelConnected>
    </div>
  );
};

export default PageContentHeader;
