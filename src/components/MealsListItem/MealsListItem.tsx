import React from 'react';
import './MealsListItem.scss';
import { MealType, availableMeals } from '../../models';
import { MealsListItemStateToPropsMapResult, MealsListItemDispatchToPropsMapResult } from './MealsListItemConnected';
import NoteInputConnected from '../NoteInput';
import NotesTableConnected from '../NotesTable';
import { Container, Badge, Icon, Preloader, Button, Loader } from '../__ui__';
import { useIdFromRoute } from '../../hooks';
import { getWordWithCount } from '../../utils';

interface MealsListItemProps extends MealsListItemStateToPropsMapResult, MealsListItemDispatchToPropsMapResult {
  mealType: MealType;
}

const MealsListItem: React.FC<MealsListItemProps> = ({
  mealType,
  collapsedMeals,
  notesForMealFetchStates,
  noteItems,
  mealOperationStatuses,
  expandMeal,
  collapseMeal,
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
    if (isCollapsed) {
      expandMeal(mealType);
    } else {
      collapseMeal(mealType);
    }
  };

  const handleAddNoteButtonClick = (): void => {
    if (isCollapsed) {
      expandMeal(mealType);
    }

    openModal('New note', <NoteInputConnected mealType={mealType} pageId={pageId}></NoteInputConnected>, {
      width: '35%',
    });
  };

  const mealsListItemContentClassNames = ['meals-list-item__content'];

  if (isCollapsed) {
    mealsListItemContentClassNames.push('meals-list-item__content_collapsed');
  }

  return (
    <Container direction="column" additionalCssClassNames={['meals-list-item']}>
      <Container align="center" spaceBetweenChildren="large" additionalCssClassNames={['meals-list-item__header']}>
        <Container
          spaceBetweenChildren="small"
          additionalCssClassNames={['meals-list-item__name']}
          onClick={handleItemHeaderClick}
        >
          <Container>
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
          </Container>
          <Container>{mealName}</Container>
        </Container>
        <Container spaceBetweenChildren="small">
          <Badge label={getWordWithCount(countNotes, 'note', 'notes')}></Badge>
          <Badge label={`${countCalories} cal`}></Badge>
        </Container>
        <Container col="12" justify="space-between" spaceBetweenChildren="medium">
          <Container col="3">
            <Button controlSize="small" onClick={handleAddNoteButtonClick} disabled={isAddNoteButtonDisabled}>
              Add note
            </Button>
          </Container>
          <Container>
            {isMealOperationInProcess && <Loader size="small" label={notesTableOperationMessage}></Loader>}
          </Container>
        </Container>
      </Container>
      <Container>
        <Container
          col="12"
          direction="column"
          spaceBetweenChildren="medium"
          additionalCssClassNames={mealsListItemContentClassNames}
        >
          <Preloader isVisible={isNotesTableLoading} label={notesTableLoadingMessage}>
            <NotesTableConnected mealType={mealType}></NotesTableConnected>
          </Preloader>
        </Container>
      </Container>
    </Container>
  );
};

export default MealsListItem;
