export interface CategoryItem {
  id: number;
  name: string;
  countProducts: number;
}

export interface CategoryCreateEdit {
  name: string;
}

export interface CategoryAutocompleteOption {
  id: number;
  name: string;
}
