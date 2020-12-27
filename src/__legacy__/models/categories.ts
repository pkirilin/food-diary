export interface CategoryItem {
  id: number;
  name: string;
  countProducts: number;
}

export interface CategoryDropdownItem {
  id: number;
  name: string;
}

export interface CategoryCreateEdit {
  name: string;
}

export interface CategoryDropdownSearchRequest {
  categoryNameFilter?: string;
}

export interface CategoryEditRequest {
  id: number;
  category: CategoryCreateEdit;
}
