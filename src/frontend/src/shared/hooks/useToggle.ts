import { useCallback, useState } from 'react';

export const useToggle = (initialValue = false): [boolean, () => void] => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(state => !state), []);
  return [value, toggle];
};
