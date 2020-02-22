import React, { useState, useRef, ReactElement } from 'react';
import './Dropdown.scss';
import { useOutsideClick, useHiddenBlockHeightCalculation } from '../../../hooks';
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
import { DropdownItem } from '..';

interface DropdownProps<T = string> extends DropdownPropsBase {
  items?: T[];
  itemRenderer?: (item: T) => ReactElement;
  togglerValueRenderer?: (item: T) => ReactElement;
  placeholder?: string;
  selectedValueIndex: number;
  onValueChange: (newSelectedValueIndex: number) => void;
}

function defaultItemRenderer<T = string>(item: T): ReactElement {
  return <React.Fragment>{item}</React.Fragment>;
}

function DropdownList<T = string>({
  items = [],
  itemRenderer = defaultItemRenderer,
  togglerValueRenderer = itemRenderer,
  toggleDirection = 'bottom',
  contentWidth = 'element-based',
  contentAlignment = 'left',
  disabled = false,
  placeholder = 'Select value',
  selectedValueIndex,
  onValueChange,
  togglerSize,
}: DropdownProps<T>): ReactElement {
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const [contentBlockHeight, setContentBlockHeight] = useState(0);

  // Dropdown hooks
  const [isOpen, toggle, close] = useToggle(disabled);
  const closeIfTargetOutside = useCloseIfTargetOutside(close);
  const togglerClassNames = useTogglerClassNames(isOpen, disabled, togglerSize);
  const togglerValueClassNames = useTogglerValueClassNames(selectedValueIndex >= 0, disabled);
  const togglerIconClassNames = useTogglerIconClassNames(disabled);
  const contentClassNames = useContentClassNames(isOpen, contentAlignment);
  const contentStyle = useContentStyle(
    toggleDirection,
    contentWidth,
    dropdownRef as React.RefObject<HTMLElement>,
    contentBlockHeight,
  );

  function handleListItemClick(this: number): void {
    if (onValueChange) {
      onValueChange(this);
    }
    close();
  }

  // Common hooks
  useOutsideClick(dropdownRef, closeIfTargetOutside);
  useHiddenBlockHeightCalculation(contentRef as React.RefObject<HTMLElement>, setContentBlockHeight);

  return (
    <div ref={dropdownRef} className="dropdown">
      <div className={togglerClassNames.join(' ')} onClick={toggle}>
        <div className={togglerValueClassNames.join(' ')}>
          {selectedValueIndex < 0 ? placeholder : togglerValueRenderer(items[selectedValueIndex])}
        </div>
        <DropdownArrowIcon className={togglerIconClassNames.join(' ')}></DropdownArrowIcon>
      </div>
      <div ref={contentRef} className={contentClassNames.join(' ')} style={contentStyle}>
        {items.map((item, index) => {
          return (
            <DropdownItem key={index} onClick={handleListItemClick.bind(index)}>
              {itemRenderer(item)}
            </DropdownItem>
          );
        })}
      </div>
    </div>
  );
}

export default DropdownList;
