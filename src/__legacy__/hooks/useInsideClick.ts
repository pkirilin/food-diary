import { useEffect } from 'react';

/**
 * Hook that handles clicks inside passed ref
 * @param ref Target element's ref
 * @param handler Action to execute on click
 * @param selector Optional selector for filtering clicked elements
 */
const useInsideClick = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void,
  selector = '*',
): void => {
  const handleClickInside = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (ref.current && ref.current.contains(target)) {
      if (target.matches(selector)) {
        handler(event);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickInside);
    return (): void => {
      document.removeEventListener('click', handleClickInside);
    };
  });
};

export default useInsideClick;
