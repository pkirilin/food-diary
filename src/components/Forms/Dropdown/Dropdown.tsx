import React, { useState, useRef } from 'react';
import './Dropdown.scss';
import DropdownItem from '../DropdownItem';
import { useOutsideClick, useHiddenBlockHeightCalculation } from '../../../hooks';
import { ReactComponent as DropdownArrowIcon } from './drop-down-arrow.svg';

interface DropdownProps {
  items: string[];
  toggleDirection?: 'top' | 'bottom';
}

const Dropdown: React.FC<DropdownProps> = ({ items, toggleDirection = 'bottom' }: DropdownProps) => {
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const [selectedValue, setSelectedValue] = useState('Select value');
  const [isOpen, setIsOpen] = useState(false);
  const [contentBlockHeight, setContentBlockHeight] = useState(0);

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

  useHiddenBlockHeightCalculation(contentRef as React.RefObject<HTMLElement>, setContentBlockHeight);

  const togglerCssClasses = ['dropdown__toggler'];
  const contentCssClasses = ['dropdown__content'];

  if (isOpen) {
    togglerCssClasses.push('dropdown__toggler_active');
    contentCssClasses.push('dropdown__content_opened');
  }

  const contentStyle: React.CSSProperties = {};

  if (toggleDirection === 'top') {
    contentStyle.top = `-${contentBlockHeight.toString()}px`;
  }

  return (
    <div ref={dropdownRef} className="dropdown">
      <div className={togglerCssClasses.join(' ')} onClick={toggle}>
        <div className="dropdown__toggler__value">{selectedValue}</div>
        <DropdownArrowIcon className="dropdown__toggler__icon"></DropdownArrowIcon>
      </div>
      <div ref={contentRef} className={contentCssClasses.join(' ')} style={contentStyle}>
        {items.map(item => (
          <DropdownItem key={item} name={item} onClick={selectItem}></DropdownItem>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
