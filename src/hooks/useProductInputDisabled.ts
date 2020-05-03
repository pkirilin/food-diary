function useProductInputDisabled(isProductOperationInProcess: boolean, isCategoryOperationInProcess: boolean): boolean {
  return isProductOperationInProcess || isCategoryOperationInProcess;
}

export default useProductInputDisabled;
