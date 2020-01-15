import { useEffect, useState } from 'react';

/**
 * Sets initial selected value if it's specified
 * @param initialSelectedValue Valuue to set
 * @param changeSelectedValue Change value handler
 */
const useInitialSelectedValue = (
  initialSelectedValue: string | undefined,
  changeSelectedValue: (newSelectedValue: string) => void,
): void => {
  // Using this to prevent redundant rerenders and to avoid warnings from useEffect's empty dep array
  const [valueChanged, setValueChanged] = useState(false);

  useEffect(() => {
    if (!valueChanged && initialSelectedValue) {
      changeSelectedValue(initialSelectedValue);
      setValueChanged(true);
    }
  }, [valueChanged, initialSelectedValue, changeSelectedValue]);
};

export default useInitialSelectedValue;
