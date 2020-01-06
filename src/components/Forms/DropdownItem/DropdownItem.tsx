import React from 'react';
import './DropdownItem.scss';

interface DropdownItemProps {
  name: string;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ name, ...props }: DropdownItemProps) => {
  return (
    <div {...props} className="dropdown-item">
      {name}
    </div>
  );
};

export default DropdownItem;
