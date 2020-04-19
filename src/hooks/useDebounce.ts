import { useState } from 'react';

function useDebounce<T = string>(action: (actionData?: T) => void, delay = 500): (data?: T) => void {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  return (data?: T): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newDebounceTimer = setTimeout(() => {
      action(data);
    }, delay);

    setDebounceTimer(newDebounceTimer);
  };
}

export default useDebounce;
