import { useEffect } from 'react';

/**
 * Changes component's current selected value if it doesn't match its initial value
 * @param selectedValue Current selected value
 * @param setSelectedValue Current selected value setter
 * @param initialSelectedValue Initial selected value to compare
 */
const useChangedSelectedValue = (
  selectedValue: string,
  setSelectedValue: (selectedValue: React.SetStateAction<string>) => void,
  initialSelectedValue?: string,
): void => {
  useEffect(() => {
    if (initialSelectedValue && selectedValue !== initialSelectedValue) {
      setSelectedValue(initialSelectedValue);
    }
  }, [initialSelectedValue, selectedValue, setSelectedValue]);
};

export default useChangedSelectedValue;
