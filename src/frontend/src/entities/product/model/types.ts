import { type SelectOption } from '@/shared/types';

export interface FormValues {
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  category: SelectOption | null;
}
