import React from 'react';
import { Meals } from '../models';
import MealsListItem from './MealsListItem';

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
