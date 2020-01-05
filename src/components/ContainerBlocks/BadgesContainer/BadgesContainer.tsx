import React from 'react';
import './BadgesContainer.scss';

const BadgesContainer: React.FC = props => {
  return <div className="badges-container">{props?.children}</div>;
};

export default BadgesContainer;
