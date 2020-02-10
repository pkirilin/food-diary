import React from 'react';
import './MealsListItem.scss';
import { MealItem } from '../../models';
import Icon from '../Icon';
import { BadgesContainer } from '../ContainerBlocks';
import Badge from '../Badge';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './MealsListItemConnected';
import NoteInput from '../NoteInput';
import NotesTableConnected from '../NotesTable';

interface MealsListItemProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  data: MealItem;
}

const MealsListItem: React.FC<MealsListItemProps> = ({
  data: meal,
  collapsedMeals,
  setCollapsedForMeal,
}: MealsListItemProps) => {
  const isCollapsed = collapsedMeals.includes(meal.type);

  const handleItemHeaderClick = (): void => {
    setCollapsedForMeal(!isCollapsed, meal.type);
  };

  return (
    <div className="meals-list-item">
      <div className="meals-list-item__header" onClick={handleItemHeaderClick}>
        <Icon
          type="right-arrow"
          size="small"
          svgStyle={
            isCollapsed
              ? {}
              : {
                  transform: 'rotate(90deg)',
                }
          }
        ></Icon>
        <div className="meals-list-item__header__name">{meal.name}</div>
        <BadgesContainer>
          <Badge label={`${meal.countNotes} ${meal.countNotes === 1 ? 'note' : 'notes'}`}></Badge>
          <Badge label={`${meal.countCalories} cal`}></Badge>
        </BadgesContainer>
      </div>
      {!isCollapsed && (
        <div className="meals-list-item__content">
          <NoteInput></NoteInput>
          <NotesTableConnected mealType={meal.type}></NotesTableConnected>
        </div>
      )}
    </div>
  );
};

export default MealsListItem;
