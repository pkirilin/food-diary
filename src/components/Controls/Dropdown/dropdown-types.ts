export type DropdownToggleDirection = 'top' | 'bottom';

export type DropdownContentAlignment = 'left' | 'right';

export interface DropdownPropsBase {
  toggleDirection?: DropdownToggleDirection;
  elementBasedContentWidth?: boolean;
  contentAlignment?: DropdownContentAlignment;
  disabled?: boolean;
}
