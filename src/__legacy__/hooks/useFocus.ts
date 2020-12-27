import { useEffect, useRef } from 'react';

/**
 * Hook that sets focus on html element by its ref
 * @param focusCondition Specifies whether element is ready to be focused
 */
function useFocus<T extends HTMLElement>(focusCondition = true): React.RefObject<T> {
  const elementToFocusRef = useRef<T>(null);

  useEffect(() => {
    if (focusCondition && elementToFocusRef.current) {
      elementToFocusRef.current.focus();
    }
  }, [focusCondition, elementToFocusRef]);

  return elementToFocusRef;
}

export default useFocus;
