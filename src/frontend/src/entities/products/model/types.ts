import { type SelectOption } from '@/types';

export interface ProductFormType {
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  category: SelectOption | null;
}
