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
  useActiveDropdownItemCleanup,
} from './Dropdown.hooks';
import { defaultItemRenderer } from './renderers';
import Input from '../Input';
import DropdownItem from '../DropdownItem';
import { Loader } from '../../__ui__';

interface DropdownListProps<T = string> extends DropdownPropsBase {
  items?: T[];
  itemRenderer?: (item: T) => ReactElement;
  placeholder?: string;
  searchable?: boolean;
  inputValue?: string;
  isContentLoading?: boolean;
  isContentVisible?: boolean;
  contentLoadingMessage?: string;
  contentErrorMessage?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onValueSelect?: (newSelectedValueIndex: number) => void;
  onInputValueChange?: (newInputValue: string) => void;
  onContentOpen?: () => void;
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
  controlSize,
  inputValue = '',
  isContentLoading = false,
  isContentVisible = true,
  contentLoadingMessage = 'Fetching elements',
  contentErrorMessage,
  inputRef,
  onValueSelect,
  onInputValueChange,
  onContentOpen,
}: DropdownListProps<T>): ReactElement {
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const [contentBlockHeight, setContentBlockHeight] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);

  // Dropdown hooks
  const [isOpen, toggle, close] = useToggle(disabled, onContentOpen, isContentVisible);
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
  useActiveDropdownItemCleanup(isOpen, setActiveItemIndex);

  function selectListItemByIndex(index: number): void {
    if (index >= 0 && onValueSelect) {
      onValueSelect(index);
    }
    close();
  }

  function handleListItemClick(this: number): void {
    selectListItemByIndex(this);
  }

  function handleInputValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const target = event.target as HTMLInputElement;
    if (onInputValueChange) {
      onInputValueChange(target.value);
    }
  }

  function handleInputFieldFocus(): void {
    if (!isOpen) {
      toggle();
    }
  }

  function handleInputFieldBlur(event: React.FocusEvent<HTMLInputElement>): void {
    if (dropdownRef) {
      const target = event.relatedTarget as HTMLElement;
      const ref = dropdownRef as React.RefObject<HTMLElement>;
      if (target && ref.current && !ref.current.contains(target)) {
        close();
      }
    }
  }

  function handleInputFieldClick(): void {
    if (!isOpen) {
      toggle();
    } else {
      if (activeItemIndex >= 0) {
        setActiveItemIndex(-1);
      }
    }
  }

  function handleDropdownKeyup(event: React.KeyboardEvent<HTMLDivElement>): void {
    function moveUp(): void {
      if (activeItemIndex < 0) {
        setActiveItemIndex(items.length - 1);
      } else {
        setActiveItemIndex(activeItemIndex === 0 ? items.length - 1 : activeItemIndex - 1);
      }
    }

    function moveDown(): void {
      if (activeItemIndex < 0) {
        setActiveItemIndex(0);
      } else {
        setActiveItemIndex(activeItemIndex < items.length - 1 ? activeItemIndex + 1 : 0);
      }
    }

    switch (event.which) {
      case 13:
        // Enter
        selectListItemByIndex(activeItemIndex);
        break;
      case 38:
        // Arrow up
        moveUp();
        break;
      case 40:
        // Arrow down
        moveDown();
        break;
      default:
        break;
    }
  }

  // Common hooks
  useOutsideClick(dropdownRef, closeIfTargetOutside);
  useHiddenBlockHeightCalculation(contentRef as React.RefObject<HTMLElement>, setContentBlockHeight);

  return (
    <div ref={dropdownRef} className="dropdown" onKeyUp={handleDropdownKeyup}>
      {searchable ? (
        <React.Fragment>
          <Input
            inputRef={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            controlSize={controlSize}
            disabled={disabled}
            onChange={handleInputValueChange}
            onFocus={handleInputFieldFocus}
            onBlur={handleInputFieldBlur}
            onClick={handleInputFieldClick}
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

      {isContentVisible && (
        <div ref={contentRef} className={contentClassNames.join(' ')} style={contentStyle}>
          {!contentErrorMessage ? (
            isContentLoading ? (
              <div className="dropdown__content_loading">
                <Loader label={contentLoadingMessage} size="small"></Loader>
              </div>
            ) : items.length === 0 ? (
              <div className="dropdown__content_empty">No elements found</div>
            ) : (
              items.map((item, index) => {
                const isActive = activeItemIndex === index;
                return (
                  <DropdownItem key={index} onClick={handleListItemClick.bind(index)} active={isActive}>
                    {itemRenderer(item)}
                  </DropdownItem>
                );
              })
            )
          ) : (
            <div className="dropdown__content_empty">{contentErrorMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DropdownList;
