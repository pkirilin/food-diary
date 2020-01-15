import React, { useState, useRef } from 'react';
import './Dropdown.scss';
import {
  useOutsideClick,
  useHiddenBlockHeightCalculation,
  useInsideClick,
  useInitialSelectedValue,
} from '../../../hooks';
import { ReactComponent as DropdownArrowIcon } from './drop-down-arrow.svg';

interface DropdownProps {
  toggleDirection?: 'top' | 'bottom';
  toggler?: JSX.Element;
  elementBasedContentWidth?: boolean;
  contentAlignment?: 'left' | 'right';
  placeholder?: string;
  initialSelectedValue?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  children,
  toggleDirection = 'bottom',
  toggler,
  elementBasedContentWidth = false,
  contentAlignment = 'left',
  placeholder = 'Select value',
  initialSelectedValue,
}: React.PropsWithChildren<DropdownProps>) => {
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const [selectedValue, setSelectedValue] = useState(placeholder);
  const [selectedValueChanged, setSelectedValueChanged] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [contentBlockHeight, setContentBlockHeight] = useState(0);

  const toggle = (): void => {
    setIsOpen(!isOpen);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const changeSelectedValue = (newSelectedValue: string): void => {
    setSelectedValue(newSelectedValue);
    setSelectedValueChanged(true);
  };

  const selectItem = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    changeSelectedValue(target.innerText);
    close();
  };

  useInitialSelectedValue(initialSelectedValue, changeSelectedValue);

  useOutsideClick(dropdownRef, (target: HTMLElement): void => {
    if (!target.matches('.dropdown')) {
      close();
    }
  });

  useInsideClick(contentRef, selectItem, '.dropdown-item');

  useHiddenBlockHeightCalculation(contentRef as React.RefObject<HTMLElement>, setContentBlockHeight);

  const togglerCssClasses = ['dropdown__toggler'];
  const togglerValueCssClasses = ['dropdown__toggler__value'];
  const contentCssClasses = ['dropdown__content'];

  if (isOpen) {
    togglerCssClasses.push('dropdown__toggler_active');
    contentCssClasses.push('dropdown__content_opened');
  }

  if (!selectedValueChanged) {
    togglerValueCssClasses.push('dropdown__toggler__value_placeholder');
  }

  const contentStyle: React.CSSProperties = {};

  if (toggleDirection === 'top') {
    contentStyle.top = `-${contentBlockHeight.toString()}px`;
  }

  if (!elementBasedContentWidth) {
    const dropdownElem = dropdownRef as React.RefObject<HTMLElement>;
    if (dropdownElem && dropdownElem.current) {
      contentStyle.width = `${dropdownElem.current.clientWidth}px`;
    }
  }

  if (contentAlignment === 'right') {
    contentCssClasses.push('dropdown__content_right');
  }

  return (
    <div ref={dropdownRef} className="dropdown">
      {toggler ? (
        <div onClick={toggle}>{toggler}</div>
      ) : (
        <div className={togglerCssClasses.join(' ')} onClick={toggle}>
          <div className={togglerValueCssClasses.join(' ')}>{selectedValue}</div>
          <DropdownArrowIcon className="dropdown__toggler__icon"></DropdownArrowIcon>
        </div>
      )}
      <div ref={contentRef} className={contentCssClasses.join(' ')} style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default Dropdown;
