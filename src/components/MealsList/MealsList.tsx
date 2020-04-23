import React from 'react';
import './MealsList.scss';
import MealsListItemConnected from '../MealsListItem';
import { availableMealTypes } from '../../models';
import { StateToPropsMapResult } from './MealsListConnected';

type MealsListProps = StateToPropsMapResult;

const MealsList: React.FC<MealsListProps> = ({ notesForPageFetchState }: MealsListProps) => {
  const { loaded, error } = notesForPageFetchState;

  return (
    <div className="meals-list">
      {loaded && !error ? (
        availableMealTypes.map((mt, index) => (
          <MealsListItemConnected key={index} mealType={mt}></MealsListItemConnected>
        ))
      ) : (
        <div className="meals-list__error">{error}</div>
      )}
    </div>
  );
};

export default MealsList;
