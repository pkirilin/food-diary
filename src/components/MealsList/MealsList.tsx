import React from 'react';
import './MealsList.scss';
import { StateToPropsMapResult } from './MealsListConnected';
import MealsListItemConnected from '../MealsListItem';

type MealsListProps = StateToPropsMapResult;

const MealsList: React.FC<MealsListProps> = ({ meals = [] }: MealsListProps) => {
  return (
    <div className="meals-list">
      {meals.map(m => (
        <MealsListItemConnected key={m.type} data={m}></MealsListItemConnected>
      ))}
    </div>
  );
};

export default MealsList;
