/**
 * Gets link CSS class name for sidebar list item.
 * @param isSelected Indicates if item is selected
 */
export const useActiveLinkClassName = (isSelected = false): string => {
  return isSelected ? 'sidebar-list-item-link_active-selected' : 'sidebar-list-item-link_active';
};
