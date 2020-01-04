import React from 'react';
import { withFdIconStyles } from '../../../hocs';
import { ReactComponent as More } from './more.svg';

const IconMoreWithStyles = withFdIconStyles(More);

const IconMore: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => {
  return <IconMoreWithStyles {...props}></IconMoreWithStyles>;
};

export default IconMore;
