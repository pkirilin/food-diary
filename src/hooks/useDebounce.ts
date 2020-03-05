import { useState } from 'react';

const useDebounce = (action: () => void, delay = 500): (() => void) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  return (): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newDebounceTimer = setTimeout(() => {
      action();
    }, delay);

    setDebounceTimer(newDebounceTimer);
  };
};

export default useDebounce;
