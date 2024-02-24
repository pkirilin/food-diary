import { useMemo, type FC, type ReactElement } from 'react';
import { type NoteItem, getMealTypes, groupNotesByMealType, type MealType } from '../models';
import { MealsListItem } from './MealsListItem';

interface Props {
  notes: NoteItem[];
  renderItem: (notes: NoteItem[], mealType: MealType) => ReactElement;
}

export const MealsList: FC<Props> = ({ notes, renderItem }) => {
  const notesGroupedByMealType = useMemo(() => groupNotesByMealType(notes), [notes]);

  return (
    <>
      {getMealTypes().map(mealType => (
        <MealsListItem
          key={mealType}
          mealType={mealType}
          notes={notesGroupedByMealType.get(mealType) ?? []}
        >
          {renderItem(notesGroupedByMealType.get(mealType) ?? [], mealType)}
        </MealsListItem>
      ))}
    </>
  );
};
