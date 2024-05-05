import { type SelectOption } from '@/types';

export interface FormValues {
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  category: SelectOption | null;
}
