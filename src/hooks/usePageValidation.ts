import { useState, useEffect } from 'react';
import { isDateStringValid } from '../utils';

function usePageValidation(pageDateStr: string): [boolean] {
  const [isPageDateValid, setIsPageDateValid] = useState(false);

  useEffect(() => {
    setIsPageDateValid(isDateStringValid(pageDateStr));
  }, [pageDateStr, setIsPageDateValid]);

  return [isPageDateValid];
}

export default usePageValidation;
