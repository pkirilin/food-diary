import { noteModel } from '@/entities/note';

const AVAILABLE_MEALS: Map<noteModel.MealType, string> = new Map<noteModel.MealType, string>([
  [noteModel.MealType.Breakfast, 'Breakfast'],
  [noteModel.MealType.SecondBreakfast, 'Second breakfast'],
  [noteModel.MealType.Lunch, 'Lunch'],
  [noteModel.MealType.AfternoonSnack, 'Afternoon snack'],
  [noteModel.MealType.Dinner, 'Dinner'],
]);

export const getMealTypes = (): noteModel.MealType[] => Array.from(AVAILABLE_MEALS.keys());

export const getMealName = (mealType: noteModel.MealType): string => {
  const mealName = AVAILABLE_MEALS.get(mealType);

  if (!mealName) {
    throw new Error(`Meal type = '${mealType}' doesn't exist`);
  }

  return mealName;
};

const assignNoteToGroup = (
  groups: Map<noteModel.MealType, noteModel.NoteItem[]>,
  note: noteModel.NoteItem,
): Map<noteModel.MealType, noteModel.NoteItem[]> => {
  const notes = groups.get(note.mealType);

  if (notes) {
    notes.push(note);
  } else {
    groups.set(note.mealType, [note]);
  }

  return groups;
};

export const groupNotesByMealType = (
  notes: noteModel.NoteItem[],
): Map<noteModel.MealType, noteModel.NoteItem[]> =>
  notes.reduce(assignNoteToGroup, new Map<noteModel.MealType, noteModel.NoteItem[]>());
