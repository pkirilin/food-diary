import React from 'react';
import './DropdownItem.scss';

type DropdownItemProps = React.DOMAttributes<HTMLInputElement>;

const DropdownItem: React.FC<React.PropsWithChildren<DropdownItemProps>> = ({
  children,
  ...props
}: React.PropsWithChildren<DropdownItemProps>) => {
  return (
    <div className="dropdown-item" {...props}>
      {children}
    </div>
  );
};

export default DropdownItem;
