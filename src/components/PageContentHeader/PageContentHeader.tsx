import React from 'react';
import './PageContentHeader.scss';
import { StateToPropsMapResult } from './PageContentHeaderConnected';
import Icon from '../Icon';

type PageContentHeaderProps = StateToPropsMapResult;

const PageContentHeader: React.FC<PageContentHeaderProps> = ({ pageDate }: PageContentHeaderProps) => {
  return (
    <div className="page-content-header">
      <Icon
        type="next-arrow"
        style={{
          transform: 'rotate(180deg)',
        }}
      ></Icon>
      <div className="page-content-header__date">{pageDate}</div>
      <Icon type="next-arrow"></Icon>
    </div>
  );
};

export default PageContentHeader;
