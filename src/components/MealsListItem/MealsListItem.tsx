import React from 'react';
import './MealsListItem.scss';
import { MealType, availableMeals } from '../../models';
import { MealsListItemStateToPropsMapResult, MealsListItemDispatchToPropsMapResult } from './MealsListItemConnected';
import NoteInputConnected from '../NoteInput';
import NotesTableConnected from '../NotesTable';
import { Container, Badge, Icon, Preloader, Button, Loader } from '../__ui__';
import { useIdFromRoute } from '../../hooks';

interface MealsListItemProps extends MealsListItemStateToPropsMapResult, MealsListItemDispatchToPropsMapResult {
  mealType: MealType;
}

const MealsListItem: React.FC<MealsListItemProps> = ({
  mealType,
  collapsedMeals,
  notesForMealFetchStates,
  noteItems,
  mealOperationStatuses,
  setCollapsedForMeal,
  openModal,
}: MealsListItemProps) => {
  const pageId = useIdFromRoute();

  const isCollapsed = collapsedMeals.includes(mealType);

  const currentMealFetchState = notesForMealFetchStates.find(s => s.mealType === mealType);
  const currentMealOperationStatus = mealOperationStatuses.find(s => s.mealType === mealType);

  const isNotesTableLoading = currentMealFetchState && currentMealFetchState.loading;
  const isMealOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;
  const isAddNoteButtonDisabled = isNotesTableLoading || isMealOperationInProcess;

  const notesTableLoadingMessage = currentMealFetchState && currentMealFetchState.loadingMessage;
  const notesTableOperationMessage = currentMealOperationStatus ? currentMealOperationStatus.message : '';

  const mealName = availableMeals.has(mealType) ? availableMeals.get(mealType) : 'Unknown meal';
  const mealNotes = noteItems.filter(n => n.mealType === mealType);

  const countNotes = mealNotes.length;
  const countCalories = mealNotes.reduce((sum, note) => sum + note.calories, 0);

  const handleItemHeaderClick = (): void => {
    setCollapsedForMeal(!isCollapsed, mealType);
  };

  const handleAddNoteButtonClick = (): void => {
    openModal('New note', <NoteInputConnected mealType={mealType} pageId={pageId}></NoteInputConnected>, {
      width: '35%',
    });
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
        <Container spaceBetweenChildren="small">
          <Badge label={`${countNotes} ${countNotes === 1 ? 'note' : 'notes'}`}></Badge>
          <Badge label={`${countCalories} cal`}></Badge>
        </Container>
      </div>
      <Container
        direction="column"
        spaceBetweenChildren="medium"
        additionalCssClassNames={mealsListItemContentClassNames}
      >
        <Container justify="space-between">
          <Container col="3">
            <Button onClick={handleAddNoteButtonClick} disabled={isAddNoteButtonDisabled}>
              Add note
            </Button>
          </Container>
          <Container col="3">
            {isMealOperationInProcess && <Loader size="small" label={notesTableOperationMessage}></Loader>}
          </Container>
        </Container>
        <Preloader isVisible={isNotesTableLoading} label={notesTableLoadingMessage}>
          <NotesTableConnected mealType={mealType}></NotesTableConnected>
        </Preloader>
      </Container>
    </div>
  );
};

export default MealsListItem;
