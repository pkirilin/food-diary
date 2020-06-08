import React from 'react';
import './Container.scss';

interface ContainerProps {
  spaceBetweenChildren?: 'small';
}

const Container: React.FC<ContainerProps> = ({
  children,
  spaceBetweenChildren,
}: React.PropsWithChildren<ContainerProps>) => {
  const style: React.CSSProperties = {};
  const classNames = ['container'];

  if (spaceBetweenChildren) {
    classNames.push(`container_child-space-${spaceBetweenChildren}`);
  }

  return (
    <div className={classNames.join(' ')} style={style}>
      {children}
    </div>
  );
};

export default Container;
