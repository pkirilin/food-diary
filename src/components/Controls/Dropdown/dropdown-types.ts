export type DropdownToggleDirection = 'top' | 'bottom';

export type DropdownContentAlignment = 'left' | 'right';

export type DropdownContentWidth = 'auto' | 'element-based' | number;

export interface DropdownPropsBase {
  toggleDirection?: DropdownToggleDirection;
  contentWidth?: DropdownContentWidth;
  contentAlignment?: DropdownContentAlignment;
  disabled?: boolean;
}
