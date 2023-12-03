import { type FC } from 'react';
import { getMealTypes } from '../models';
import MealsListItem from './MealsListItem';

const MealsList: FC = () => {
  return (
    <>
      {getMealTypes().map((mealType, index) => (
        <MealsListItem key={index} mealType={mealType} />
      ))}
    </>
  );
};

export default MealsList;
