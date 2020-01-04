import React from 'react';
import '../FDIcon.scss';
import { ReactComponent as SortDescending } from './sort-descending.svg';
import { withFdIconStyles } from '../../../hocs';

const IconSortDescendingWithStyles = withFdIconStyles(SortDescending);

const IconSortDescending: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => {
  return <IconSortDescendingWithStyles {...props}></IconSortDescendingWithStyles>;
};

export default IconSortDescending;
