import { AutocompleteOption } from '../__shared__/models';

export interface CategoryItem {
  id: number;
  name: string;
  countProducts: number;
}

export interface CategoryCreateEdit {
  name: string;
}

export type CategoryAutocompleteOption = AutocompleteOption;
