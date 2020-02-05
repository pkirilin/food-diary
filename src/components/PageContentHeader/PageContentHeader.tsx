import React from 'react';
import './PageContentHeader.scss';
import { StateToPropsMapResult } from './PageContentHeaderConnected';
import Icon from '../Icon';
import { useParams, NavLink } from 'react-router-dom';

type PageContentHeaderProps = StateToPropsMapResult;

const PageContentHeader: React.FC<PageContentHeaderProps> = ({ pageDate, visiblePagesIds }: PageContentHeaderProps) => {
  const { id: currentPageIdFromRoute } = useParams();
  const currentPageId = currentPageIdFromRoute !== undefined ? +currentPageIdFromRoute : 0;
  const currentPageIndex = visiblePagesIds.findIndex(id => id === currentPageId);

  const isPreviousPageExists = currentPageIndex > 0;
  const isNextPageExists = currentPageIndex > -1 && currentPageIndex < visiblePagesIds.length - 1;

  const previousPageId = visiblePagesIds[currentPageIndex - 1];
  const nextPageId = visiblePagesIds[currentPageIndex + 1];

  return (
    <div className="page-content-header">
      {isPreviousPageExists ? (
        <NavLink to={`/pages/${previousPageId}`}>
          <Icon
            type="next-arrow"
            svgStyle={{
              transform: 'rotate(180deg)',
            }}
          ></Icon>
        </NavLink>
      ) : (
        <Icon
          type="next-arrow"
          svgStyle={{
            transform: 'rotate(180deg)',
          }}
          disabled
        ></Icon>
      )}
      <div className="page-content-header__date">{pageDate}</div>
      {isNextPageExists ? (
        <NavLink to={`/pages/${nextPageId}`}>
          <Icon type="next-arrow"></Icon>
        </NavLink>
      ) : (
        <Icon type="next-arrow" disabled></Icon>
      )}
    </div>
  );
};

export default PageContentHeader;
