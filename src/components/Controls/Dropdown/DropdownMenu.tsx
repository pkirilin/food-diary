import React, { useRef, useState } from 'react';
import './Dropdown.scss';
import { useToggle, useCloseIfTargetOutside, useContentClassNames, useContentStyle } from './Dropdown.hooks';
import { useOutsideClick, useInsideClick, useHiddenBlockHeightCalculation } from '../../../hooks';
import { DropdownPropsBase } from './dropdown-types';

interface DropdownMenuProps extends DropdownPropsBase {
  toggler: JSX.Element;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  toggler,
  toggleDirection = 'bottom',
  elementBasedContentWidth = false,
  contentAlignment = 'left',
  disabled = false,
}: React.PropsWithChildren<DropdownMenuProps>) => {
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const [contentBlockHeight, setContentBlockHeight] = useState(0);

  // Dropdown hooks
  const [isOpen, toggle, close] = useToggle(disabled);
  const contentClassNames = useContentClassNames(isOpen, contentAlignment);
  const closeIfTargetOutside = useCloseIfTargetOutside(close);
  const contentStyle = useContentStyle(
    toggleDirection,
    elementBasedContentWidth,
    dropdownRef as React.RefObject<HTMLElement>,
    contentBlockHeight,
  );

  const handleMenuItemClick = (): void => {
    close();
  };

  // Common hooks
  useOutsideClick(dropdownRef, closeIfTargetOutside);
  useInsideClick(contentRef, handleMenuItemClick, '.dropdown-item');
  useHiddenBlockHeightCalculation(contentRef as React.RefObject<HTMLElement>, setContentBlockHeight);

  return (
    <div ref={dropdownRef} className="dropdown">
      <div onClick={toggle}>{toggler}</div>
      <div ref={contentRef} className={contentClassNames.join(' ')} style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default DropdownMenu;
