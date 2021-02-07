export enum MealType {
  Breakfast = 1,
  SecondBreakfast = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
}

export class Meals {
  private static readonly _availableMeals: Map<MealType, string> = new Map<MealType, string>([
    [MealType.Breakfast, 'Breakfast'],
    [MealType.SecondBreakfast, 'Second breakfast'],
    [MealType.Lunch, 'Lunch'],
    [MealType.AfternoonSnack, 'Afternoon snack'],
    [MealType.Dinner, 'Dinner'],
  ]);

  public static get(): MealType[] {
    return Array.from(this._availableMeals.keys());
  }

  public static getName(mealType: MealType): string {
    const mealName = this._availableMeals.get(mealType);

    if (!mealName) {
      throw new Error(`Meal type = '${mealType}' doesn't exist`);
    }

    return mealName;
  }
}

export interface NoteItem {
  id: number;
  mealType: MealType;
  displayOrder: number;
  productId: number;
  productName: string;
  productQuantity: number;
  calories: number;
}

export interface NoteCreateEdit {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}
