export const useActiveLinkClassName = (isSelected = false): string => {
  return isSelected ? 'sidebar-list-item-link_active-selected' : 'sidebar-list-item-link_active';
};
