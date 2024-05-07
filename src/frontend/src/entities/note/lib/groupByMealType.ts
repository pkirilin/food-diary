import { type NoteItem, type MealType } from '../model';

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

export const groupByMealType = (notes: NoteItem[]): Map<MealType, NoteItem[]> =>
  notes.reduce(assignNoteToGroup, new Map<MealType, NoteItem[]>());
