import { MealOperationStatus } from '../store';
import { MealType } from '../models';

function useNoteInputDisabled(
  mealOperationStatuses: MealOperationStatus[],
  mealType: MealType,
  isPageOperationInProcess: boolean,
): boolean {
  const currentMealOperationStatus = mealOperationStatuses.find(s => s.mealType === mealType);
  const isMealOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;
  return isMealOperationInProcess || isPageOperationInProcess;
}

export default useNoteInputDisabled;
