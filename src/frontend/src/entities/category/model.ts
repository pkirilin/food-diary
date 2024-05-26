import { type SelectOption } from '@/shared/types';

export interface Category {
  id: number;
  name: string;
  countProducts: number;
}

export type AutocompleteOption = SelectOption;
