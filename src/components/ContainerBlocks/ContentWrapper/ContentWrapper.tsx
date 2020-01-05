import React from 'react';
import './ContentWrapper.scss';

const ContentWrapper: React.FC = props => {
  return <div className="content-wrapper">{props?.children}</div>;
};

export default ContentWrapper;
