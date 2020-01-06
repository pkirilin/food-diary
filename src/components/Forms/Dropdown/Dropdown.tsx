import React, { useState, useRef } from 'react';
import './Dropdown.scss';
import DropdownItem from '../DropdownItem';
import { useOutsideClick } from '../../../hooks';

interface DropdownProps {
  items: string[];
}

const Dropdown: React.FC<DropdownProps> = ({ items }: DropdownProps) => {
  const dropdownRef = useRef(null);
  const [selectedValue, setSelectedValue] = useState('Select value');
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (): void => {
    setIsOpen(!isOpen);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const selectItem = (event: React.MouseEvent): void => {
    const target = event.target as HTMLElement;
    setSelectedValue(target.innerText);
    setIsOpen(false);
  };

  useOutsideClick(dropdownRef, (target: HTMLElement): void => {
    if (!target.matches('.dropdown')) {
      close();
    }
  });

  const togglerCssClasses = ['dropdown__toggler'];
  const contentCssClasses = ['dropdown__content'];

  if (isOpen) {
    togglerCssClasses.push('dropdown__toggler_active');
    contentCssClasses.push('dropdown__content_opened');
  }

  return (
    <div ref={dropdownRef} className="dropdown">
      <div className={togglerCssClasses.join(' ')} onClick={toggle}>
        {selectedValue}
      </div>
      <div className={contentCssClasses.join(' ')}>
        {items.map(item => (
          <DropdownItem key={item} name={item} onClick={selectItem}></DropdownItem>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
