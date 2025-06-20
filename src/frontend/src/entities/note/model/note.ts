import { type productModel } from '@/entities/product';
import { type NoteItem } from '../api';
import { addNullable, calculateNutritionValue } from '../lib/calculationHelpers';

export const calculateCalories = ({ product, productQuantity }: NoteItem): number =>
  Math.floor((product.calories * productQuantity) / 100);

export const calculateNutritionValues = (notes: NoteItem[]): productModel.NutritionValues => {
  const nutritionValues: productModel.NutritionValues = {
    calories: 0,
    protein: null,
    fats: null,
    carbs: null,
    sugar: null,
    salt: null,
  };

  for (const note of notes) {
    nutritionValues.calories += calculateCalories(note);

    nutritionValues.protein = addNullable(
      nutritionValues.protein,
      calculateNutritionValue(note, p => p.protein),
    );

    nutritionValues.fats = addNullable(
      nutritionValues.fats,
      calculateNutritionValue(note, p => p.fats),
    );

    nutritionValues.carbs = addNullable(
      nutritionValues.carbs,
      calculateNutritionValue(note, p => p.carbs),
    );

    nutritionValues.sugar = addNullable(
      nutritionValues.sugar,
      calculateNutritionValue(note, p => p.sugar),
    );

    nutritionValues.salt = addNullable(
      nutritionValues.salt,
      calculateNutritionValue(note, p => p.salt),
    );
  }

  return nutritionValues;
};
