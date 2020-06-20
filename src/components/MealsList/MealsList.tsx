import React from 'react';
import './MealsList.scss';
import MealsListItemConnected from '../MealsListItem';
import { availableMealTypes } from '../../models';
import { MealsListStateToPropsMapResult } from './MealsListConnected';

type MealsListProps = MealsListStateToPropsMapResult;

const MealsList: React.FC<MealsListProps> = ({ notesForPageFetchState }: MealsListProps) => {
  const classNames = ['meals-list'];
  const { loading: areNotesForPageLoading } = notesForPageFetchState;

  if (areNotesForPageLoading) classNames.push('meals-list_loading');

  return (
    <div className={classNames.join(' ')}>
      {availableMealTypes.map((mt, index) => (
        <MealsListItemConnected key={index} mealType={mt}></MealsListItemConnected>
      ))}
    </div>
  );
};

export default MealsList;
