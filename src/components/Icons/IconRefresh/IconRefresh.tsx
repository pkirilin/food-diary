import React from 'react';
import '../Icon.scss';
import { ReactComponent as Refresh } from './refresh.svg';
import { withFdIconStyles } from '../../../hocs';

const IconRefreshWithStyles = withFdIconStyles(Refresh);

const IconRefresh: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => {
  return <IconRefreshWithStyles {...props}></IconRefreshWithStyles>;
};

export default IconRefresh;
