import { useState } from 'react';

/**
 * Defines a bahaviour for hiding/showing some object when it's hovered (or not).
 * Returns a tuple containing:
 * - Boolean value indicating whether an object should be visible or not
 * - Event handler showing the object
 * - Event handler hiding the object
 */
const useHover = (): [boolean, React.MouseEventHandler, React.MouseEventHandler] => {
  const [isObjectVisible, setIsObjectVisible] = useState(false);

  const show = (): void => {
    setIsObjectVisible(true);
  };

  const hide = (): void => {
    setIsObjectVisible(false);
  };

  return [isObjectVisible, show, hide];
};

export default useHover;
