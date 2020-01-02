import React from 'react';
import './FDListItemBadges.scss';

const FDListItemBadges: React.FC = props => {
  return <div className="fd-list__item-badges">{props?.children}</div>;
};

export default FDListItemBadges;
