import React from 'react';
import MealsListItem from './MealsListItem';
import { Meals } from '../models';

const MealsList: React.FC = () => {
  return (
    <React.Fragment>
      {Meals.get().map((mealType, index) => (
        <MealsListItem key={index} mealType={mealType} />
      ))}
    </React.Fragment>
  );
};

export default MealsList;
