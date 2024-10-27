import { type SelectOption } from '@/shared/types';

export interface ProductDraft {
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  category: SelectOption | null;
}

export interface Image {
  name: string;
  base64: string;
}
