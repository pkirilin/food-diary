import React from 'react';
import '../FDIcon.scss';
import { ReactComponent as FilterReset } from './filter-reset.svg';
import { withFdIconStyles } from '../../../hocs';

const IconFilterResetWithStyles = withFdIconStyles(FilterReset);

const IconFilterReset: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => {
  return <IconFilterResetWithStyles {...props}></IconFilterResetWithStyles>;
};

export default IconFilterReset;
