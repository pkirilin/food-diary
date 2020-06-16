import React from 'react';
import './DropdownItem.scss';

interface DropdownItemProps extends React.DOMAttributes<HTMLInputElement> {
  active?: boolean;
}

const DropdownItem: React.FC<React.PropsWithChildren<DropdownItemProps>> = ({
  children,
  active = false,
  ...props
}: React.PropsWithChildren<DropdownItemProps>) => {
  const classNames = ['dropdown-item'];

  if (active) {
    classNames.push('dropdown-item_active');
  }

  return (
    <div className={classNames.join(' ')} {...props}>
      {children}
    </div>
  );
};

export default DropdownItem;
