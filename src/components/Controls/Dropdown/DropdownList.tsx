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
  useDropdownArrowClassNames,
  useContentClassNames,
  useContentStyle,
} from './Dropdown.hooks';
import { defaultItemRenderer } from './renderers';
import Input from '../Input';
import DropdownItem from '../DropdownItem';

interface DropdownListProps<T = string> extends DropdownPropsBase {
  items?: T[];
  itemRenderer?: (item: T) => ReactElement;
  placeholder?: string;
  searchable?: boolean;
  inputValue?: string;
  onValueSelect: (newSelectedValueIndex: number) => void;
  onInputValueChange?: (newInputValue: string) => void;
}

function DropdownList<T = string>({
  items = [],
  itemRenderer = defaultItemRenderer,
  toggleDirection = 'bottom',
  contentWidth = 'element-based',
  contentAlignment = 'left',
  disabled = false,
  placeholder = 'Select value',
  searchable = false,
  onValueSelect,
  controlSize,
  inputValue = '',
  onInputValueChange,
}: DropdownListProps<T>): ReactElement {
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const [contentBlockHeight, setContentBlockHeight] = useState(0);

  // Dropdown hooks
  const [isOpen, toggle, close] = useToggle(disabled);
  const closeIfTargetOutside = useCloseIfTargetOutside(close);
  const togglerClassNames = useTogglerClassNames(isOpen, disabled, controlSize);
  const togglerValueClassNames = useTogglerValueClassNames(inputValue !== '', disabled);
  const dropdownArrowClassNames = useDropdownArrowClassNames(disabled, true, controlSize);
  const contentClassNames = useContentClassNames(isOpen, contentAlignment);
  const contentStyle = useContentStyle(
    toggleDirection,
    contentWidth,
    dropdownRef as React.RefObject<HTMLElement>,
    contentBlockHeight,
  );

  function handleListItemClick(this: number): void {
    if (onValueSelect) {
      onValueSelect(this);
    }
    close();
  }

  function handleInputValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement;
    if (onInputValueChange) {
      onInputValueChange(target.value);
    }
  }

  // Common hooks
  useOutsideClick(dropdownRef, closeIfTargetOutside);
  useHiddenBlockHeightCalculation(contentRef as React.RefObject<HTMLElement>, setContentBlockHeight);

  return (
    <div ref={dropdownRef} className="dropdown">
      {searchable ? (
        <React.Fragment>
          <Input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onClick={toggle}
            onChange={handleInputValueChange}
            controlSize={controlSize}
          />
          <DropdownArrowIcon className={dropdownArrowClassNames.join(' ')}></DropdownArrowIcon>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className={togglerClassNames.join(' ')} onClick={toggle}>
            <div className={togglerValueClassNames.join(' ')}>{inputValue === '' ? placeholder : inputValue}</div>
            <DropdownArrowIcon className={dropdownArrowClassNames.join(' ')}></DropdownArrowIcon>
          </div>
        </React.Fragment>
      )}

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
