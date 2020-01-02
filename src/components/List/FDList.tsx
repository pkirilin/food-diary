import React from 'react';
import './FDList.scss';

const FDList: React.FC = props => {
  return <div className="fd-list">{props?.children}</div>;
};

export default FDList;
