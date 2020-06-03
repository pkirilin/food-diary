import { useState } from 'react';

/**
 * Returns function which sets timer with specified delay and performs action, when time if out.
 * Timer refreshes each time function is called
 * @param action Action to perform
 * @param delay Timer delay
 */
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
