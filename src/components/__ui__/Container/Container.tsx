import React from 'react';
import './Container.scss';

interface ContainerProps {
  justify?: 'center' | 'space-between';
  align?: 'center' | 'flex-end';
  direction?: 'row' | 'column';
  col?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
  textColor?: 'middle-green';
  spaceBetweenChildren?: 'small' | 'medium';
}

const Container: React.FC<ContainerProps> = ({
  children,
  justify,
  align,
  direction,
  col,
  textColor,
  spaceBetweenChildren,
}: React.PropsWithChildren<ContainerProps>) => {
  const baseClassName = 'container';
  const classNames = [baseClassName];

  if (justify) classNames.push(`${baseClassName}_justify-${justify}`);

  if (align) classNames.push(`${baseClassName}_align-${align}`);

  if (direction) classNames.push(`${baseClassName}_direction-${direction}`);

  if (col) classNames.push(`${baseClassName}_col-${col}`);

  if (textColor) classNames.push(`${baseClassName}_text-color-${textColor}`);

  if (spaceBetweenChildren) {
    if (direction === 'column') {
      classNames.push(`${baseClassName}_child-space-col-${spaceBetweenChildren}`);
    } else {
      classNames.push(`${baseClassName}_child-space-row-${spaceBetweenChildren}`);
    }
  }

  return <div className={classNames.join(' ')}>{children}</div>;
};

export default Container;
