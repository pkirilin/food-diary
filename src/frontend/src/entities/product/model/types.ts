import { type SelectOption } from '@/types';

export interface FormValues {
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  category: SelectOption | null;
}

interface AutocompleteBaseOption {
  freeSolo?: boolean;
  name: string;
  defaultQuantity: number;
}

export interface AutocompleteExistingOption extends AutocompleteBaseOption {
  freeSolo?: false;
  id: number;
}

export interface AutocompleteFreeSoloOption extends AutocompleteBaseOption {
  freeSolo: true;
  editing: boolean;
  caloriesCost: number;
  category: SelectOption | null;
  inputValue?: string;
}

export type AutocompleteOptionType = AutocompleteExistingOption | AutocompleteFreeSoloOption;
