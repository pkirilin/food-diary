import { addNullable, calculateNutritionValue } from './calculationHelpers';
import { type MealDraftFoodLog, type NutritionValues } from './types';

export const calculateCalories = ({ product, quantity }: MealDraftFoodLog): number =>
  Math.floor((product.calories * quantity) / 100);

export const calculateNutritionValues = (foodLogs: MealDraftFoodLog[]): NutritionValues => {
  const nutritionValues: NutritionValues = {
    calories: 0,
    protein: null,
    fats: null,
    carbs: null,
    sugar: null,
    salt: null,
  };

  for (const foodLog of foodLogs) {
    nutritionValues.calories += calculateCalories(foodLog);

    nutritionValues.protein = addNullable(
      nutritionValues.protein,
      calculateNutritionValue(foodLog, p => p.protein),
    );

    nutritionValues.fats = addNullable(
      nutritionValues.fats,
      calculateNutritionValue(foodLog, p => p.fats),
    );

    nutritionValues.carbs = addNullable(
      nutritionValues.carbs,
      calculateNutritionValue(foodLog, p => p.carbs),
    );

    nutritionValues.sugar = addNullable(
      nutritionValues.sugar,
      calculateNutritionValue(foodLog, p => p.sugar),
    );

    nutritionValues.salt = addNullable(
      nutritionValues.salt,
      calculateNutritionValue(foodLog, p => p.salt),
    );
  }

  return nutritionValues;
};
