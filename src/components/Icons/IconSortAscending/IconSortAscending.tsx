import React from 'react';
import '../Icon.scss';
import { ReactComponent as SortAscending } from './sort-ascending.svg';
import { withFdIconStyles } from '../../../hocs';

const IconSortAscendingWithStyles = withFdIconStyles(SortAscending);

const IconSortAscending: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => {
  return <IconSortAscendingWithStyles {...props}></IconSortAscendingWithStyles>;
};

export default IconSortAscending;
