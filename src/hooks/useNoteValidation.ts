import { useState, useEffect } from 'react';

function useNoteValidation(productNameInputValue: string, productQuantity: number): [boolean, boolean] {
  const [isProductNameValid, setIsProductNameValid] = useState(false);
  const [isProductQuantityValid, setIsProductQuantityValid] = useState(false);

  useEffect(() => {
    setIsProductNameValid(productNameInputValue.trim() !== '');
  }, [productNameInputValue, setIsProductNameValid]);

  useEffect(() => {
    setIsProductQuantityValid(productQuantity >= 10 && productQuantity <= 1000);
  }, [productQuantity, setIsProductQuantityValid]);

  return [isProductNameValid, isProductQuantityValid];
}

export default useNoteValidation;
