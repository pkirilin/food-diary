import React from 'react';
import './Icon.scss';
import { IconType, IconSize } from './Icon.types';
import { useIconType } from './Icon.hooks';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  type: IconType;
  size?: IconSize;
}

const Icon: React.FC<IconProps> = ({ type, size = 'normal', ...svgProps }: IconProps) => {
  const classNames: string[] = ['icon'];
  if (size && size !== 'normal') {
    classNames.push(`icon_${size}`);
  }

  const IconSvgComponent = useIconType(type);

  return <IconSvgComponent {...svgProps} className={classNames.join(' ')}></IconSvgComponent>;
};

export default Icon;
