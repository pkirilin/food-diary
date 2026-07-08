import { productApi, type SuggestProductNutritionResponse } from '../api';

export type SuggestNutritionFn = (name: string) => Promise<SuggestProductNutritionResponse>;

export const useSuggestNutrition = (): SuggestNutritionFn => {
  const [trigger] = productApi.useSuggestNutritionMutation();
  return async name => await trigger({ name }).unwrap();
};
