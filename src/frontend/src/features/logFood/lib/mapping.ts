import { foodLogModel } from '@/entities/foodLog';
import { type CreateNotesRequest, noteModel, type RecognizeNoteItem } from '@/entities/note';
import {
  type CreateProductRequest,
  type EditProductRequest,
  type GetProductByIdResponse,
  type ProductSelectOption,
  type productModel,
} from '@/entities/product';

const FOOD_LOG_MEAL_TYPES: Record<noteModel.MealType, foodLogModel.MealType> = {
  [noteModel.MealType.Breakfast]: foodLogModel.MealType.Breakfast,
  [noteModel.MealType.SecondBreakfast]: foodLogModel.MealType.SecondBreakfast,
  [noteModel.MealType.Lunch]: foodLogModel.MealType.Lunch,
  [noteModel.MealType.AfternoonSnack]: foodLogModel.MealType.AfternoonSnack,
  [noteModel.MealType.Dinner]: foodLogModel.MealType.Dinner,
};

const NOTE_MEAL_TYPES: Record<foodLogModel.MealType, noteModel.MealType> = {
  [foodLogModel.MealType.Breakfast]: noteModel.MealType.Breakfast,
  [foodLogModel.MealType.SecondBreakfast]: noteModel.MealType.SecondBreakfast,
  [foodLogModel.MealType.Lunch]: noteModel.MealType.Lunch,
  [foodLogModel.MealType.AfternoonSnack]: noteModel.MealType.AfternoonSnack,
  [foodLogModel.MealType.Dinner]: noteModel.MealType.Dinner,
};

export const toFoodLogMealType = (mealType: noteModel.MealType): foodLogModel.MealType =>
  FOOD_LOG_MEAL_TYPES[mealType];

export const toNoteMealType = (mealType: foodLogModel.MealType): noteModel.MealType =>
  NOTE_MEAL_TYPES[mealType];

export const toCreateNotesRequest = ({
  date,
  mealType,
  foodLogs,
}: foodLogModel.MealDraft): CreateNotesRequest => ({
  date,
  mealType: toNoteMealType(mealType),
  notes: foodLogs.map(({ product, quantity }) => ({
    productId: product.id,
    productQuantity: quantity,
  })),
});

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

export const toCreateProductRequest = (
  categoryId: number,
  {
    name,
    calories: caloriesCost,
    defaultQuantity,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

export const toRecognizedProductFormValues = ({
  product,
  quantity,
}: RecognizeNoteItem): productModel.ProductFormValues => ({
  name: product.name.trim(),
  defaultQuantity: quantity,
  category: null,
  calories: product.caloriesCost,
  protein: product.protein,
  fats: product.fats,
  carbs: product.carbs,
  sugar: product.sugar,
  salt: product.salt,
});

export const toEditProductRequest = (
  id: number,
  categoryId: number,
  values: productModel.ProductFormValues,
): EditProductRequest => ({ id, ...toCreateProductRequest(categoryId, values) });

export const toProductFormValues = ({
  id,
  name,
  caloriesCost,
  defaultQuantity,
  category,
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: GetProductByIdResponse): productModel.ProductFormValues => ({
  id,
  name,
  calories: caloriesCost,
  defaultQuantity,
  category: { id: category.id, name: category.name },
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

export const toMealDraftProductFromForm = (
  id: number,
  {
    name,
    defaultQuantity,
    calories,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
): foodLogModel.MealDraftProduct => ({
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

export const toMealDraftProductFromResponse = ({
  id,
  name,
  defaultQuantity,
  caloriesCost,
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: GetProductByIdResponse): foodLogModel.MealDraftProduct => ({
  id,
  name,
  defaultQuantity,
  calories: caloriesCost,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});
