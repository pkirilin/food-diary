import React from 'react';
import './Container.scss';

interface ContainerProps {
  justify?: 'center';
  align?: 'center';
  textColor?: 'middle-green';
  spaceBetweenChildren?: 'small';
}

const Container: React.FC<ContainerProps> = ({
  children,
  justify,
  align,
  textColor,
  spaceBetweenChildren,
}: React.PropsWithChildren<ContainerProps>) => {
  const baseClassName = 'container';
  const classNames = [baseClassName];

  if (justify) classNames.push(`${baseClassName}_justify-${justify}`);

  if (align) classNames.push(`${baseClassName}_align-${align}`);

  if (textColor) classNames.push(`${baseClassName}_text-color-${textColor}`);

  if (spaceBetweenChildren) classNames.push(`${baseClassName}_child-space-${spaceBetweenChildren}`);

  return <div className={classNames.join(' ')}>{children}</div>;
};

export default Container;
