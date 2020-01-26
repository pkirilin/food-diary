import React, { useState, useRef } from 'react';
import './Dropdown.scss';
import {
  useOutsideClick,
  useHiddenBlockHeightCalculation,
  useInsideClick,
  useInitialSelectedValue,
  useChangedSelectedValue,
} from '../../../hooks';
import { ReactComponent as DropdownArrowIcon } from './drop-down-arrow.svg';
import { DropdownPropsBase } from './dropdown-types';
import {
  useToggle,
  useCloseIfTargetOutside,
  useTogglerClassNames,
  useTogglerValueClassNames,
  useTogglerIconClassNames,
  useContentClassNames,
  useContentStyle,
} from './Dropdown.hooks';

interface DropdownProps extends DropdownPropsBase {
  placeholder?: string;
  initialSelectedValue?: string;
  onValueChanged?: (newSelectedValue: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  children,
  toggleDirection = 'bottom',
  contentWidth = 'auto',
  contentAlignment = 'left',
  disabled = false,
  placeholder = 'Select value',
  initialSelectedValue,
  onValueChanged,
}: React.PropsWithChildren<DropdownProps>) => {
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const [selectedValue, setSelectedValue] = useState(placeholder);
  const [selectedValueChanged, setSelectedValueChanged] = useState(false);
  const [contentBlockHeight, setContentBlockHeight] = useState(0);

  // Dropdown hooks
  const [isOpen, toggle, close] = useToggle(disabled);
  const closeIfTargetOutside = useCloseIfTargetOutside(close);
  const togglerClassNames = useTogglerClassNames(isOpen, disabled);
  const togglerValueClassNames = useTogglerValueClassNames(selectedValueChanged, disabled);
  const togglerIconClassNames = useTogglerIconClassNames(disabled);
  const contentClassNames = useContentClassNames(isOpen, contentAlignment);
  const contentStyle = useContentStyle(
    toggleDirection,
    contentWidth,
    dropdownRef as React.RefObject<HTMLElement>,
    contentBlockHeight,
  );

  const changeSelectedValue = (newSelectedValue: string): void => {
    setSelectedValue(newSelectedValue);
    setSelectedValueChanged(true);

    if (newSelectedValue !== initialSelectedValue && onValueChanged) {
      onValueChanged(newSelectedValue);
    }
  };

  const handleListItemClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    changeSelectedValue(target.innerText);
    close();
  };

  // Common hooks
  useInitialSelectedValue(initialSelectedValue, changeSelectedValue);
  useChangedSelectedValue(selectedValue, setSelectedValue, initialSelectedValue);
  useOutsideClick(dropdownRef, closeIfTargetOutside);
  useInsideClick(contentRef, handleListItemClick, '.dropdown-item');
  useHiddenBlockHeightCalculation(contentRef as React.RefObject<HTMLElement>, setContentBlockHeight);

  return (
    <div ref={dropdownRef} className="dropdown">
      <div className={togglerClassNames.join(' ')} onClick={toggle}>
        <div className={togglerValueClassNames.join(' ')}>{selectedValue}</div>
        <DropdownArrowIcon className={togglerIconClassNames.join(' ')}></DropdownArrowIcon>
      </div>
      <div ref={contentRef} className={contentClassNames.join(' ')} style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default Dropdown;
