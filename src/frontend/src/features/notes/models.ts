export enum MealType {
  Breakfast = 1,
  SecondBreakfast = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
}

const AVAILABLE_MEALS: Map<MealType, string> = new Map<MealType, string>([
  [MealType.Breakfast, 'Breakfast'],
  [MealType.SecondBreakfast, 'Second breakfast'],
  [MealType.Lunch, 'Lunch'],
  [MealType.AfternoonSnack, 'Afternoon snack'],
  [MealType.Dinner, 'Dinner'],
]);

export const getMealTypes = (): MealType[] => Array.from(AVAILABLE_MEALS.keys());

export const getMealName = (mealType: MealType): string => {
  const mealName = AVAILABLE_MEALS.get(mealType);

  if (!mealName) {
    throw new Error(`Meal type = '${mealType}' doesn't exist`);
  }

  return mealName;
};

const assignNoteToGroup = (
  groups: Map<MealType, NoteItem[]>,
  note: NoteItem,
): Map<MealType, NoteItem[]> => {
  const notes = groups.get(note.mealType);

  if (notes) {
    notes.push(note);
  } else {
    groups.set(note.mealType, [note]);
  }

  return groups;
};

export const groupNotesByMealType = (notes: NoteItem[]): Map<MealType, NoteItem[]> =>
  notes.reduce(assignNoteToGroup, new Map<MealType, NoteItem[]>());

export interface NoteItem {
  id: number;
  mealType: MealType;
  displayOrder: number;
  productId: number;
  productName: string;
  productQuantity: number;
  productDefaultQuantity: number;
  calories: number;
}

export interface NoteCreateEdit {
  mealType: MealType;
  productId: number;
  pageId: number;
  productQuantity: number;
  displayOrder: number;
}
