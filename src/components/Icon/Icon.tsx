import React from 'react';
import './Icon.scss';
import { IconType, IconSize } from './Icon.types';
import { useIconType } from './Icon.hooks';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  type: IconType;
  size?: IconSize;
  disabled?: boolean;
}

const Icon: React.FC<IconProps> = ({ type, size = 'normal', disabled = false, onClick, ...svgProps }: IconProps) => {
  const classNames: string[] = ['icon'];
  if (size && size !== 'normal') {
    classNames.push(`icon_${size}`);
  }

  if (disabled) {
    classNames.push('disabled');
  }

  const IconSvgComponent = useIconType(type);

  return (
    <IconSvgComponent
      {...svgProps}
      // Disabled icon must not be clickable
      onClick={disabled ? undefined : onClick}
      className={classNames.join(' ')}
    ></IconSvgComponent>
  );
};

export default Icon;
