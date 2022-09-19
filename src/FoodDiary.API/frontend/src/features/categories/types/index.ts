import { AutocompleteOption } from 'src/types';

export type Category = {
  id: number;
  name: string;
  countProducts: number;
};

export type CategoryFormData = {
  name: string;
};

export type CategoryAutocompleteOption = AutocompleteOption;
