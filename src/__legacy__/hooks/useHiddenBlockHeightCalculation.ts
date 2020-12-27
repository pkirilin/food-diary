import { useEffect } from 'react';

/**
 * Gets target block's height (even if block is hidden) and sets its value to local state using specified setter
 * @param targetBlock Target block ref (casted to HTMLElement)
 * @param setHeight Height value setter
 */
const useHiddenBlockHeightCalculation = (
  targetBlock: React.RefObject<HTMLElement>,
  setHeight: React.Dispatch<React.SetStateAction<number>>,
): void => {
  useEffect(() => {
    if (targetBlock.current != null) {
      // remembering previous styles
      const prevVisibility = targetBlock.current.style.visibility;
      const prevDisplay = targetBlock.current.style.display;

      // temporarily change display:none  to visibility:hidden as display:none hides block sizes
      targetBlock.current.style.visibility = 'hidden';
      targetBlock.current.style.display = 'block';

      // now target block size should be available
      setHeight(targetBlock.current.clientHeight);

      // returning previous styles back
      targetBlock.current.style.visibility = prevVisibility;
      targetBlock.current.style.display = prevDisplay;
    }
  }, [targetBlock, setHeight]);
};

export default useHiddenBlockHeightCalculation;
