import React, { useEffect } from 'react';
import './MealsList.scss';
import MealsListItemConnected from '../MealsListItem';
import { availableMealTypes } from '../../models';
import { MealsListStateToPropsMapResult, MealsListDispatchToPropsMapResult } from './MealsListConnected';
import { useIdFromRoute } from '../../hooks';

interface MealsListProps extends MealsListStateToPropsMapResult, MealsListDispatchToPropsMapResult {}

const MealsList: React.FC<MealsListProps> = ({ notesForPageFetchState, setCollapsedForAllMeals }: MealsListProps) => {
  const classNames = ['meals-list'];
  const { loading: areNotesForPageLoading } = notesForPageFetchState;

  if (areNotesForPageLoading) classNames.push('meals-list_loading');

  const pageId = useIdFromRoute();

  useEffect(() => {
    return (): void => {
      setCollapsedForAllMeals(false, availableMealTypes);
    };
  }, [pageId, setCollapsedForAllMeals]);

  return (
    <div className={classNames.join(' ')}>
      {availableMealTypes.map((mt, index) => (
        <MealsListItemConnected key={index} mealType={mt}></MealsListItemConnected>
      ))}
    </div>
  );
};

export default MealsList;
