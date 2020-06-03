import { useState, useEffect } from 'react';
import { isDateStringValid } from '../utils';

/**
 * Validates page data and returns validation state for each validated field
 * @param pageDateStr Page date string representation
 */
function usePageValidation(pageDateStr: string): [boolean] {
  const [isPageDateValid, setIsPageDateValid] = useState(false);

  useEffect(() => {
    setIsPageDateValid(isDateStringValid(pageDateStr));
  }, [pageDateStr, setIsPageDateValid]);

  return [isPageDateValid];
}

export default usePageValidation;
