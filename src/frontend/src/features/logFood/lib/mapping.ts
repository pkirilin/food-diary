import { foodLogModel } from '@/entities/foodLog';
import { noteModel } from '@/entities/note';
import { type ProductSelectOption } from '@/entities/product';

const FOOD_LOG_MEAL_TYPES: Record<noteModel.MealType, foodLogModel.MealType> = {
  [noteModel.MealType.Breakfast]: foodLogModel.MealType.Breakfast,
  [noteModel.MealType.SecondBreakfast]: foodLogModel.MealType.SecondBreakfast,
  [noteModel.MealType.Lunch]: foodLogModel.MealType.Lunch,
  [noteModel.MealType.AfternoonSnack]: foodLogModel.MealType.AfternoonSnack,
  [noteModel.MealType.Dinner]: foodLogModel.MealType.Dinner,
};

export const toFoodLogMealType = (mealType: noteModel.MealType): foodLogModel.MealType =>
  FOOD_LOG_MEAL_TYPES[mealType];

export const toMealDraftProduct = ({
  id,
  name,
  defaultQuantity,
  calories,
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: ProductSelectOption): foodLogModel.MealDraftProduct => ({
  id,
  name,
  defaultQuantity,
  calories,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});
