import { MealOperationStatus } from '../store';
import { MealType } from '../models';

/**
 * Controls whether note input is disabled
 * @param mealOperationStatuses Operation request statuses for meals
 * @param mealType Target note's meal type
 * @param isPageOperationInProcess Indicates if any page operation is performing
 */
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
