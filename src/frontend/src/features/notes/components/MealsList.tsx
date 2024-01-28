import { useMemo, type FC } from 'react';
import { type NoteItem, getMealTypes, groupNotesByMealType } from '../models';
import MealsListItem from './MealsListItem';

interface MealsListProps {
  notes: NoteItem[];
}

const MealsList: FC<MealsListProps> = ({ notes }) => {
  const notesGroupedByMealType = useMemo(() => groupNotesByMealType(notes), [notes]);

  return (
    <>
      {getMealTypes().map(mealType => (
        <MealsListItem
          key={mealType}
          mealType={mealType}
          notes={notesGroupedByMealType.get(mealType) ?? []}
        />
      ))}
    </>
  );
};

export default MealsList;
