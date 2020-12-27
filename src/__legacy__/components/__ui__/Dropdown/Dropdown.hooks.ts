import { useState, useEffect } from 'react';
import {
  DropdownToggleDirection,
  DropdownContentAlignment,
  DropdownContentWidth,
  DropdownTogglerSize,
} from './dropdown-types';

export const useToggle = (
  disabled: boolean,
  onContentOpen?: () => void,
  isContentVisible = true,
): [
  // isOpen dropdown state
  boolean,

  // Toggle dropdown function
  () => void,

  // Close dropdown function
  () => void,
] => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && onContentOpen && isContentVisible) {
        onContentOpen();
      }
    }
  };

  const close = (): void => {
    setIsOpen(false);
  };

  return [isOpen, toggle, close];
};

export const useCloseIfTargetOutside = (close: () => void): ((target: HTMLElement) => void) => {
  const closeIfTargetOutside = (target: HTMLElement): void => {
    if (!target.matches('.dropdown')) {
      close();
    }
  };

  return closeIfTargetOutside;
};

export const useContentStyle = (
  toggleDirection: DropdownToggleDirection,
  contentWidth: DropdownContentWidth,
  dropdownElement: React.RefObject<HTMLElement>,
  contentBlockHeight: number,
): React.CSSProperties => {
  const contentStyle: React.CSSProperties = {};

  if (toggleDirection === 'top') {
    contentStyle.top = `-${contentBlockHeight.toString()}px`;
  }

  if (contentWidth === 'element-based') {
    if (dropdownElement && dropdownElement.current) {
      contentStyle.width = `${dropdownElement.current.clientWidth}px`;
    }
  } else {
    if (typeof contentWidth === 'number') {
      contentStyle.width = `${contentWidth.toString()}px`;
    }
  }

  return contentStyle;
};

export const useContentClassNames = (isOpen: boolean, contentAlignment: DropdownContentAlignment): string[] => {
  const contentClassNames = ['dropdown__content'];

  if (isOpen) {
    contentClassNames.push('dropdown__content_opened');
  }

  if (contentAlignment === 'right') {
    contentClassNames.push('dropdown__content_right');
  }

  return contentClassNames;
};

export const useTogglerClassNames = (
  isOpen: boolean,
  isDisabled: boolean,
  togglerSize?: DropdownTogglerSize,
): string[] => {
  const togglerClassNames = ['dropdown__toggler'];

  if (isOpen) {
    togglerClassNames.push('dropdown__toggler_active');
  }

  if (isDisabled) {
    togglerClassNames.push('dropdown__toggler_disabled');
  }

  if (togglerSize) {
    togglerClassNames.push('dropdown__toggler_small');
  }

  return togglerClassNames;
};

export const useTogglerValueClassNames = (selectedValueChanged: boolean, isDisabled: boolean): string[] => {
  const togglerValueClassNames = ['dropdown__toggler__value'];

  if (!selectedValueChanged) {
    togglerValueClassNames.push(`dropdown__toggler__value_${isDisabled ? 'placeholder-disabled' : 'placeholder'}`);
  }

  if (isDisabled) {
    togglerValueClassNames.push('dropdown__toggler__value_disabled');
  }

  return togglerValueClassNames;
};

export const useDropdownArrowClassNames = (
  isDisabled: boolean,
  isInput: boolean,
  size?: DropdownTogglerSize,
): string[] => {
  const dropdownArrowClassNames = ['dropdown-arrow'];

  if (isInput) {
    dropdownArrowClassNames.push('dropdown-arrow_input');

    if (size) {
      dropdownArrowClassNames.push(`dropdown-arrow_input_${size}`);
    }

    if (isDisabled) {
      dropdownArrowClassNames.push('dropdown-arrow_input_disabled');
    }
  } else {
    if (isDisabled) {
      dropdownArrowClassNames.push('dropdown-arrow_disabled');
    }
  }

  return dropdownArrowClassNames;
};

export const useActiveDropdownItemCleanup = (
  isOpen: boolean,
  setActiveItemIndex: React.Dispatch<React.SetStateAction<number>>,
): void => {
  useEffect(() => {
    if (!isOpen) {
      setActiveItemIndex(-1);
    }
  }, [isOpen, setActiveItemIndex]);
};
