import React from 'react';
import './MealsListItem.scss';
import { MealType, availableMeals } from '../../models';
import Icon from '../Icon';
import { BadgesContainer } from '../ContainerBlocks';
import Badge from '../Badge';
import { MealsListItemStateToPropsMapResult, MealsListItemDispatchToPropsMapResult } from './MealsListItemConnected';
import NoteInputConnected from '../NoteInput';
import NotesTableConnected from '../NotesTable';
import Loader from '../Loader';

interface MealsListItemProps extends MealsListItemStateToPropsMapResult, MealsListItemDispatchToPropsMapResult {
  mealType: MealType;
}

const MealsListItem: React.FC<MealsListItemProps> = ({
  mealType,
  collapsedMeals,
  notesForMealFetchStates,
  noteItems,
  setCollapsedForMeal,
}: MealsListItemProps) => {
  const isCollapsed = collapsedMeals.includes(mealType);

  const currentMealFetchState = notesForMealFetchStates.find(s => s.mealType === mealType);

  if (!currentMealFetchState) {
    return null;
  }

  const { loading: isNotesTableLoading, loadingMessage: notesTableLoadingMessage } = currentMealFetchState;

  const mealName = availableMeals.has(mealType) ? availableMeals.get(mealType) : 'Unknown meal';
  const mealNotes = noteItems.filter(n => n.mealType === mealType);

  const countNotes = mealNotes.length;
  const countCalories = mealNotes.reduce((sum, note) => sum + note.calories, 0);

  const handleItemHeaderClick = (): void => {
    setCollapsedForMeal(!isCollapsed, mealType);
  };

  const mealsListItemContentClassNames = ['meals-list-item__content'];

  if (isCollapsed) {
    mealsListItemContentClassNames.push('meals-list-item__content_collapsed');
  }

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
        <div className="meals-list-item__header__name">{mealName}</div>
        <BadgesContainer>
          <Badge label={`${countNotes} ${countNotes === 1 ? 'note' : 'notes'}`}></Badge>
          <Badge label={`${countCalories} cal`}></Badge>
        </BadgesContainer>
      </div>
      <div className={mealsListItemContentClassNames.join(' ')}>
        <NoteInputConnected mealType={mealType}></NoteInputConnected>
        <div className="meals-list-item__content__notes">
          {isNotesTableLoading && (
            <div className="meals-list-item__content__notes__preloader">
              <Loader label={notesTableLoadingMessage}></Loader>
            </div>
          )}
          <NotesTableConnected mealType={mealType}></NotesTableConnected>
        </div>
      </div>
    </div>
  );
};

export default MealsListItem;
