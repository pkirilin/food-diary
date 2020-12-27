import React from 'react';
import './Icon.scss';
import { IconType, IconSize } from './Icon.types';
import { useIconType } from './Icon.hooks';

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  type: IconType;
  size?: IconSize;
  disabled?: boolean;
  label?: string;
  svgStyle?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({
  type,
  size = 'normal',
  disabled = false,
  onClick,
  label,
  svgStyle = {},
  ...props
}: IconProps) => {
  const iconContainerClassNames = ['icon-container'];
  const labelClassNames = ['icon-container__label'];
  const iconClassNames = ['icon-container__icon', `icon-container__icon_${size}`];

  if (disabled) {
    iconContainerClassNames.push('icon-container_disabled');
    labelClassNames.push('icon-container__label_disabled');
    iconClassNames.push('icon-container__icon_disabled');
  }

  const IconSvgComponent = useIconType(type);

  return (
    <div {...props} onClick={disabled ? undefined : onClick} className={iconContainerClassNames.join(' ')}>
      <IconSvgComponent style={svgStyle} className={iconClassNames.join(' ')}></IconSvgComponent>
      {label && <div className={labelClassNames.join(' ')}>{label}</div>}
    </div>
  );
};

export default Icon;
