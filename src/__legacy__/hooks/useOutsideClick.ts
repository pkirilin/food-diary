import { useEffect } from 'react';

/**
 * Hook that handles clicks outside of the passed ref
 * @param ref Target element's ref
 * @param handler Action to execute on outside click
 */
const useOutsideClick = (ref: React.RefObject<HTMLInputElement>, handler: (target: HTMLElement) => void): void => {
  const handleClickOutside = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (ref.current && !ref.current.contains(target)) {
      handler(target);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return (): void => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
};

export default useOutsideClick;
