import React from 'react';
import './FDContentWrapper.scss';

const FDContentWrapper: React.FC = props => {
  return <div className="fd-content-wrapper">{props?.children}</div>;
};

export default FDContentWrapper;
