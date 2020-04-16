import React from 'react';
import './MealsListItem.scss';
import { MealItem } from '../../models';
import Icon from '../Icon';
import { BadgesContainer } from '../ContainerBlocks';
import Badge from '../Badge';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './MealsListItemConnected';
import NoteInputConnected from '../NoteInput';
import NotesTableConnected from '../NotesTable';
import Loader from '../Loader';

interface MealsListItemProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  data: MealItem;
}

const MealsListItem: React.FC<MealsListItemProps> = ({
  data: meal,
  collapsedMeals,
  setCollapsedForMeal,
  notesForMealFetchStates,
}: MealsListItemProps) => {
  const isCollapsed = collapsedMeals.includes(meal.type);

  const currentMealFetchState = notesForMealFetchStates.filter(s => s.mealType === meal.type)[0];
  const isNotesTableLoading = currentMealFetchState && currentMealFetchState.loading;
  const countNotes = meal.notes.length;
  const countCalories = meal.notes.reduce((sum, note) => sum + note.calories, 0);

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
          <Badge label={`${countNotes} ${countNotes === 1 ? 'note' : 'notes'}`}></Badge>
          <Badge label={`${countCalories} cal`}></Badge>
        </BadgesContainer>
      </div>
      {!isCollapsed && (
        <div className="meals-list-item__content">
          <NoteInputConnected mealType={meal.type}></NoteInputConnected>
          <div className="meals-list-item__content__notes">
            {isNotesTableLoading && (
              <div className="meals-list-item__content__notes__preloader">
                <Loader label="Loading notes"></Loader>
              </div>
            )}
            <NotesTableConnected mealType={meal.type}></NotesTableConnected>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsListItem;
