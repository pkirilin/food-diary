import React from 'react';
import '../Icon.scss';
import { ReactComponent as Filter } from './filter.svg';
import { withFdIconStyles } from '../../../hocs';

const IconFilterWithStyles = withFdIconStyles(Filter);

const IconFilter: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => {
  return <IconFilterWithStyles {...props}></IconFilterWithStyles>;
};

export default IconFilter;
