import React from 'react';
import '../Icon.scss';
import { ReactComponent as Add } from './add.svg';
import { withFdIconStyles } from '../../../hocs';

const IconAddWithStyles = withFdIconStyles(Add);

const IconAdd: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => {
  return <IconAddWithStyles {...props}></IconAddWithStyles>;
};

export default IconAdd;
