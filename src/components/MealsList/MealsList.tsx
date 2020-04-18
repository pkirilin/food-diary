import React from 'react';
import './MealsList.scss';
import MealsListItemConnected from '../MealsListItem';
import { availableMealTypes } from '../../models';

const MealsList: React.FC = () => {
  return (
    <div className="meals-list">
      {availableMealTypes.map((mt, index) => (
        <MealsListItemConnected key={index} mealType={mt}></MealsListItemConnected>
      ))}
    </div>
  );
};

export default MealsList;
