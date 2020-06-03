/**
 * Controls whether product input is disabled
 * @param isProductOperationInProcess Indicates if any product operation if performing
 * @param isCategoryOperationInProcess Indicates if any category operation if performing
 */
function useProductInputDisabled(isProductOperationInProcess: boolean, isCategoryOperationInProcess: boolean): boolean {
  return isProductOperationInProcess || isCategoryOperationInProcess;
}

export default useProductInputDisabled;
