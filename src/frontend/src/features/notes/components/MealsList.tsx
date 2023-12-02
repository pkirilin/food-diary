import React from 'react';
import { getMealTypes } from '../models';
import MealsListItem from './MealsListItem';

const MealsList: React.FC = () => {
  return (
    <React.Fragment>
      {getMealTypes().map((mealType, index) => (
        <MealsListItem key={index} mealType={mealType} />
      ))}
    </React.Fragment>
  );
};

export default MealsList;
